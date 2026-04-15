async function loadStudents() {
    const res = await fetch('/students/');
    const data = await res.json();
    const list = document.getElementById('student-list');
    list.innerHTML = data.map(s => `
        <tr>
            <td>${s.id}</td><td>${s.student_code}</td>
            <td>${s.fullname}</td><td>${s.gpa}</td>
            <td><button class="btn btn-danger btn-sm" onclick="deleteStudent(${s.id})">Xóa</button></td>
        </tr>
    `).join('');
}

async function addStudent() {
    const gpaInput = document.getElementById('gpa');
    const gpa = parseFloat(gpaInput.value);

    if (isNaN(gpa) || gpa < 0.1 || gpa > 4.0) {
        alert("GPA phải nằm trong khoảng 0.1 - 4.0");
        gpaInput.focus();
        return;
    }

    const payload = {
        student_code: document.getElementById('code').value,
        fullname: document.getElementById('name').value,
        gpa: gpa
    };

    await fetch('/students/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    loadStudents();
}

async function deleteStudent(id) {
    await fetch(`/students/${id}`, { method: 'DELETE' });
    loadStudents();
}

loadStudents();