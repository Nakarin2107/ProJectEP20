

const maxRequestsPerPage = 8;
const totalPages = 1000; 
let currentPage = parseInt(new URLSearchParams(window.location.search).get('page')) || 1; // กำหนดหน้าปัจจุบันจาก URL หรือเป็นหน้าแรก

// ดึงข้อมูลคำขอจาก Local Storage
function getRequests() {
    try {
        const requests = JSON.parse(localStorage.getItem('requests')) || [];
        return requests;
    } catch (error) {
        console.error('ไม่สามารถดึงข้อมูลคำขอจาก Local Storage ได้:', error);
        return [];
    }
}

// ฟังก์ชันสร้างรายงานตามเดือนและปีที่เลือก
function generateReport() {
    try {
        const monthInput = document.getElementById('reportMonth').value;
        if (!monthInput) {
            console.warn('กรุณาเลือกเดือนและปี');
            return;
        }

        const [selectedYear, selectedMonth] = monthInput.split('-').map(Number);
        const requests = getRequests();

        // กรองคำขอตามเดือนและปีที่เลือก โดยไม่กรองสถานะ
        const filteredRequests = requests.filter(request => {
            const requestDate = new Date(request.dateTime);
            return (
                requestDate.getFullYear() === selectedYear &&
                requestDate.getMonth() + 1 === selectedMonth
            );
        });

        displayReport(filteredRequests);
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการสร้างรายงาน:', error);
    }
}

// ฟังก์ชันแสดงข้อมูลในตารางรายงาน
function displayReport(requests) {
    const reportTableBody = document.querySelector('#reportTable tbody');
    reportTableBody.innerHTML = ''; // ล้างข้อมูลเก่าออกก่อน

    if (requests.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="6">ไม่พบข้อมูลที่ตรงกับเดือนและปีที่เลือก</td>';
        reportTableBody.appendChild(emptyRow);
        return;
    }

    // คำนวณคำขอที่จะแสดงในหน้าปัจจุบัน
    const startIndex = (currentPage - 1) * maxRequestsPerPage;
    const endIndex = startIndex + maxRequestsPerPage;
    const paginatedRequests = requests.slice(startIndex, endIndex);

    paginatedRequests.forEach(request => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(request.dateTime)}</td>
            <td>${request.returnDateTime ? formatDate(request.returnDateTime) : '-'}</td>
            <td>${request.equipment}</td>
            <td>${request.studentName}</td>
            <td>${request.studentId}</td>
            <td>${request.staffName || '-'}</td>
            <td>${request.status}</td> <!-- เพิ่มสถานะ -->

        `;
        reportTableBody.appendChild(row);
    });

    updatePaginationInfo(requests.length);
}

// ฟังก์ชันสำหรับฟอร์แมตวันที่ให้อยู่ในรูปแบบที่ต้องการ
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear() + 543; // แปลงเป็น พ.ศ.
        return `${day}-${month}-${year}`;
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการฟอร์แมตวันที่:', error);
        return '-';
    }
}

function updatePaginationInfo(totalRequests) {
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = ''; // ล้าง Pagination เก่า

    const totalPageCount = Math.ceil(totalRequests / maxRequestsPerPage);
    const maxVisibleButtons = 10;

    // สร้างปุ่ม หน้าแรก
    const firstButton = document.createElement('button');
    firstButton.textContent = 'หน้าแรก';
    firstButton.className = 'btn btn-primary btn-sm mx-1';
    firstButton.disabled = currentPage === 1;
    firstButton.onclick = () => {
        currentPage = 1;
        generateReport();
    };
    paginationContainer.appendChild(firstButton);

    // สร้างปุ่ม Previous พร้อมไอคอน
    const prevButton = document.createElement('button');
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.className = 'btn btn-secondary btn-sm mx-1';
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            generateReport();
        }
    };
    paginationContainer.appendChild(prevButton);

    
    // สร้างปุ่มหมายเลขเพจ
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = startPage + maxVisibleButtons - 1;

    if (endPage > totalPageCount) {
        endPage = totalPageCount;
        startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.className = 'btn btn-outline-primary btn-sm mx-1';
        if (i === currentPage) {
            pageButton.classList.add('active');
        }
        pageButton.onclick = () => {
            currentPage = i;
            generateReport();
        };
        paginationContainer.appendChild(pageButton);
    }

    // สร้างปุ่ม Next พร้อมไอคอน
    const nextButton = document.createElement('button');
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.className = 'btn btn-secondary btn-sm mx-1';
    nextButton.disabled = currentPage === totalPageCount;
    nextButton.onclick = () => {
        if (currentPage < totalPageCount) {
            currentPage++;
            generateReport();
        }
    };
    paginationContainer.appendChild(nextButton);

    // สร้างปุ่ม หน้าสุดท้าย
    const lastButton = document.createElement('button');
    lastButton.textContent = 'หน้าสุดท้าย';
    lastButton.className = 'btn btn-primary btn-sm mx-1';
    lastButton.disabled = currentPage === totalPageCount;
    lastButton.onclick = () => {
        currentPage = totalPageCount;
        generateReport();
    };
    paginationContainer.appendChild(lastButton);
}

// กำหนดค่าเดือนปัจจุบันเมื่อหน้าเว็บโหลด
document.addEventListener("DOMContentLoaded", function() {
    const reportMonthInput = document.getElementById("reportMonth");
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0'); // เพิ่มเลข 0 ข้างหน้าเดือนที่มีหลักเดียว
    reportMonthInput.value = `${year}-${month}`;
});

// เรียกฟังก์ชันเพื่อสร้างรายงานเมื่อหน้าโหลดเสร็จ
window.onload = generateReport;
