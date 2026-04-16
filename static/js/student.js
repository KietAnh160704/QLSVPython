let allStudents = [];

function setFieldError(errorId, message) {
    const errorEl = document.getElementById(errorId);
    if (errorEl) {
        errorEl.textContent = message || '';
    }
}

function setFormMessage(formMessageId, message) {
    const messageEl = document.getElementById(formMessageId);
    if (messageEl) {
        messageEl.textContent = message || '';
    }
}

function clearValidationMessages(prefix) {
    setFieldError(`${prefix}-code-error`, '');
    setFieldError(`${prefix}-name-error`, '');
    setFieldError(`${prefix}-gpa-error`, '');
    setFormMessage(`${prefix}-form-message`, '');
}

function sanitizeStudentCodeInput(inputElement) {
    inputElement.value = String(inputElement.value || '').replace(/\D/g, '').slice(0, 10);
}

function sanitizeFullnameInput(inputElement) {
    const sanitized = String(inputElement.value || '').replace(/[^\p{L}\s]/gu, '');
    inputElement.value = sanitized.replace(/\s{2,}/g, ' ');
}

function attachInputGuards() {
    ['add-code', 'edit-code'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', () => sanitizeStudentCodeInput(input));
        }
    });

    ['add-name', 'edit-name'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', () => sanitizeFullnameInput(input));
        }
    });
}

function validateStudentInput(code, fullname, gpa, prefix) {
    const trimmedCode = String(code || '').trim();
    const trimmedName = String(fullname || '').trim();
    const codeRegex = /^\d{10}$/;
    let isValid = true;

    clearValidationMessages(prefix);

    if (!codeRegex.test(trimmedCode)) {
        setFieldError(`${prefix}-code-error`, 'MSSV phải gồm đúng 10 chữ số.');
        isValid = false;
    }

    if (!trimmedName) {
        setFieldError(`${prefix}-name-error`, 'Họ tên không được để trống.');
        isValid = false;
    }

    if (!Number.isFinite(gpa) || gpa < 0.1 || gpa > 4.0) {
        setFieldError(`${prefix}-gpa-error`, 'GPA phải trong khoảng từ 0.1 đến 4.0.');
        isValid = false;
    }

    return isValid;
}

async function fetchWithValidation(url, options) {
    const res = await fetch(url, options);
    if (!res.ok) {
        let errorMessage = 'Dữ liệu không hợp lệ hoặc có lỗi từ máy chủ.';
        try {
            const errorData = await res.json();
            if (Array.isArray(errorData?.detail)) {
                errorMessage = errorData.detail.map(item => item.msg).join('\n');
            } else if (typeof errorData?.detail === 'string') {
                errorMessage = errorData.detail;
            }
        } catch (error) {
            // Keep default error message when response body is not JSON.
        }
        throw new Error(errorMessage);
    }
    return res;
}

function normalizeText(value) {
    return String(value ?? '').toLowerCase().trim();
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    if (pageId === 'list-page') loadStudents();
}

function updateSearchCount(currentCount, totalCount) {
    const countEl = document.getElementById('search-count');
    if (countEl) {
        countEl.textContent = `${currentCount} / ${totalCount} kết quả`;
    }
}

function renderStudents(students) {
    const list = document.getElementById('student-list');
    if (!students.length) {
        list.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">Không có sinh viên phù hợp</td></tr>';
        updateSearchCount(0, allStudents.length);
        return;
    }

    list.innerHTML = students.map(s => `
        <tr>
            <td><strong>${s.student_code}</strong></td>
            <td>${s.fullname}</td>
            <td>
                <small class="text-muted d-block">${s.department || 'N/A'}</small>
                <span class="badge badge-major">${s.major || 'N/A'}</span>
            </td>
            <td><span class="badge bg-primary fs-6">${s.gpa}</span></td>
            <td>
                <button class="btn btn-outline-warning btn-sm" onclick='goEditPage(${s.id}, ${JSON.stringify(s.student_code)}, ${JSON.stringify(s.fullname)}, ${s.gpa}, ${JSON.stringify(s.department)}, ${JSON.stringify(s.major)})'>Sửa</button>
                <button class="btn btn-outline-danger btn-sm" onclick="deleteStudent(${s.id})">Xóa</button>
            </td>
        </tr>
    `).join('');

    updateSearchCount(students.length, allStudents.length);
}

async function loadStudents() {
    const res = await fetch('/students/');
    allStudents = await res.json();
    filterStudents();
}

function filterStudents() {
    const keyword = normalizeText(document.getElementById('search').value);
    if (!keyword) {
        renderStudents(allStudents);
        return;
    }

    const filtered = allStudents.filter(student => {
        return [
            student.id,
            student.student_code,
            student.fullname,
            student.gpa,
            student.department,
            student.major
        ].some(field => normalizeText(field).includes(keyword));
    });

    renderStudents(filtered);
}

function clearSearch() {
    const searchInput = document.getElementById('search');
    searchInput.value = '';
    filterStudents();
    searchInput.focus();
}

async function addStudent() {
    const studentCode = document.getElementById('add-code').value;
    const fullname = document.getElementById('add-name').value;
    const gpa = parseFloat(document.getElementById('add-gpa').value);

    if (!validateStudentInput(studentCode, fullname, gpa, 'add')) {
        return;
    }

    const payload = {
        student_code: studentCode.trim(),
        fullname: fullname.trim(),
        gpa: gpa,
        department: document.getElementById('add-dept').value,
        major: document.getElementById('add-major').value
    };
    try {
        await fetchWithValidation('/students/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        showPage('list-page');
        document.getElementById('add-code').value = '';
        document.getElementById('add-name').value = '';
        document.getElementById('add-dept').value = '';
        document.getElementById('add-major').value = '';
        document.getElementById('add-gpa').value = '';
        clearValidationMessages('add');
    } catch (error) {
        setFormMessage('add-form-message', error.message);
    }
}

function goEditPage(id, code, name, gpa, dept, major) {
    document.getElementById('edit-id').value = id;
    document.getElementById('edit-code').value = code;
    document.getElementById('edit-name').value = name;
    document.getElementById('edit-gpa').value = gpa;
    document.getElementById('edit-dept').value = (dept !== 'undefined' && dept !== 'null') ? dept : '';
    document.getElementById('edit-major').value = (major !== 'undefined' && major !== 'null') ? major : '';
    showPage('edit-page');
}

async function updateStudent() {
    const id = document.getElementById('edit-id').value;
    const studentCode = document.getElementById('edit-code').value;
    const fullname = document.getElementById('edit-name').value;
    const gpa = parseFloat(document.getElementById('edit-gpa').value);

    if (!validateStudentInput(studentCode, fullname, gpa, 'edit')) {
        return;
    }

    const payload = {
        student_code: studentCode.trim(),
        fullname: fullname.trim(),
        gpa: gpa,
        department: document.getElementById('edit-dept').value,
        major: document.getElementById('edit-major').value
    };
    try {
        await fetchWithValidation(`/students/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        clearValidationMessages('edit');
        showPage('list-page');
    } catch (error) {
        setFormMessage('edit-form-message', error.message);
    }
}

async function deleteStudent(id) {
    if (confirm("Bạn có chắc chắn muốn xóa sinh viên này?")) {
        await fetch(`/students/${id}`, { method: 'DELETE' });
        loadStudents();
    }
}

attachInputGuards();
loadStudents();