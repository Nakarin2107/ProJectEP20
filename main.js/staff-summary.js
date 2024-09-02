document.addEventListener('DOMContentLoaded', () => {
    populateStaffSelect();
    setDefaultMonthAndYear(); // เรียกฟังก์ชันตั้งค่าเริ่มต้น
});

function populateStaffSelect() {
    const staffSelect = document.getElementById('staffSelect');
    const requests = JSON.parse(localStorage.getItem('requests')) || [];

    // ดึงรายชื่อเจ้าหน้าที่ที่ไม่ซ้ำกัน
    const staffNames = [...new Set(requests.map(request => request.staffName))];

    // เพิ่มรายการเจ้าหน้าที่ลงใน select
    staffNames.forEach(staff => {
        const option = document.createElement('option');
        option.value = staff;
        option.textContent = staff;
        staffSelect.appendChild(option);
    });
}

function setDefaultMonthAndYear() {
    const currentDate = new Date();
    const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // ดึงเดือนปัจจุบัน
    const currentYear = currentDate.getFullYear(); // ดึงปีปัจจุบัน

    // ตั้งค่าให้ select ของเดือนและ input ของปี
    document.getElementById('monthSelect').value = currentMonth;
    document.getElementById('yearSelect').value = currentYear;
}

function generateStaffSummary() {
    const selectedStaff = document.getElementById('staffSelect').value;
    const selectedMonth = document.getElementById('monthSelect').value; // รับค่าเดือนที่เลือก
    const selectedYear = document.getElementById('yearSelect').value; // รับค่าปีที่เลือก
    const requests = JSON.parse(localStorage.getItem('requests')) || [];

    // กรองคำขอโดยใช้ชื่อเจ้าหน้าที่ที่เลือกและเดือน-ปีที่เลือก
    const filteredRequests = requests.filter(request => {
        const requestDate = new Date(request.dateTime);
        const requestMonth = (requestDate.getMonth() + 1).toString().padStart(2, '0');
        const requestYear = requestDate.getFullYear().toString();

        return request.staffName === selectedStaff && requestMonth === selectedMonth && requestYear === selectedYear;
    });

    const summaryContainer = document.getElementById('staffSummaryContainer');
    summaryContainer.innerHTML = ''; // ล้างข้อมูลเก่าออกก่อน

    if (filteredRequests.length === 0) {
        // แสดงการแจ้งเตือนด้วย SweetAlert2
        Swal.fire({
            icon: 'warning',
            title: 'ไม่พบข้อมูล',
            text: 'ไม่พบข้อมูลที่ตรงกับเจ้าหน้าที่และเดือนที่เลือก',
            confirmButtonText: 'ตกลง'
        });
        return;
    }

    // สร้างตารางแสดงผลการอนุมัติของเจ้าหน้าที่
    const table = document.createElement('table');
    table.className = 'table table-bordered';
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `
        <th>วันที่ยืม</th>
        <th>วันที่คืน</th>
        <th>อุปกรณ์</th>
        <th>ชื่อนักศึกษา</th>
        <th>รหัสนักศึกษา</th>
        <th>สถานะ</th>
    `;
    table.appendChild(headerRow);

    filteredRequests.forEach(request => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(request.dateTime)}</td>
            <td>${request.returnDateTime ? formatDate(request.returnDateTime) : '-'}</td>
            <td>${request.equipment}</td>
            <td>${request.studentName}</td>
            <td>${request.studentId}</td>
            <td>${request.status}</td>
        `;
        table.appendChild(row);
    });

    summaryContainer.appendChild(table);
}


function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear() + 543; // แปลงเป็น พ.ศ.
    return `${day}-${month}-${year}`;
}
