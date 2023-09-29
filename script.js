document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            processData(content);
        };
        reader.readAsText(file);
    }
});

function processData(data) {
    const records = data.split('\n');

    const filteredEmployees = records
        .map(record => record.split(',')) // 
        .filter(employee => {
            const name = employee[0];
            const position = employee[1];
            const shiftStart = new Date(employee[2]);
            const shiftEnd = new Date(employee[3]);

            // Condition a: Worked for 7 consecutive days
            const consecutiveDays = checkConsecutiveDays(records, name, shiftStart);
            
            // Condition b: Less than 10 hours between shifts but greater than 1 hour
            const timeBetweenShifts = checkTimeBetweenShifts(records, name, shiftStart);
            
            // Condition c: Worked for more than 14 hours in a single shift
            const longShift = (shiftEnd - shiftStart) > 14 * 60 * 60 * 1000;

            return consecutiveDays && timeBetweenShifts && longShift;
        });

    displayResults(filteredEmployees);
}

function checkConsecutiveDays(records, name) {
    const consecutiveDaysThreshold = 7; 

    const shiftsForEmployee = records.filter(employee => {
        const employeeName = employee[0];
        return employeeName === name;
    });

    shiftsForEmployee.sort((a, b) => {
        const shiftAStart = new Date(a[2]);
        const shiftBStart = new Date(b[2]);
        return shiftAStart - shiftBStart;
    });

    let consecutiveDaysCount = 1; 
    let previousShiftEnd = new Date(shiftsForEmployee[3]);

    for (let i = 1; i < shiftsForEmployee.length; i++) {
        const currentShiftStart = new Date(shiftsForEmployee[i][2]);
        const currentShiftEnd = new Date(shiftsForEmployee[i][3]);

        
        const timeDiff = (currentShiftStart - previousShiftEnd) / (1000 * 60 * 60 * 24); 
        if (timeDiff === 1) {
            consecutiveDaysCount++;
            if (consecutiveDaysCount >= consecutiveDaysThreshold) {
                return true; 
            }
        } else {
            consecutiveDaysCount = 1; 
        }

        previousShiftEnd = currentShiftEnd;
    }

    return false; 
}


function checkTimeBetweenShifts(records, name, shiftStart) {
    const minHoursBetweenShifts = 1; 
    const maxHoursBetweenShifts = 10; 

   
    const shiftsForEmployee = records.filter(employee => {
        const employeeName = employee[0];
        return employeeName === name;
    });

    
    shiftsForEmployee.sort((a, b) => {
        const shiftAStart = new Date(a[2]);
        const shiftBStart = new Date(b[2]);
        return shiftAStart - shiftBStart;
    });

    for (let i = 0; i < shiftsForEmployee.length - 1; i++) {
        const currentShiftStart = new Date(shiftsForEmployee[i][2]);
        const nextShiftStart = new Date(shiftsForEmployee[i + 1][2]);

        
        const timeDiffHours = (nextShiftStart - currentShiftStart) / (1000 * 60 * 60);

        if (timeDiffHours > minHoursBetweenShifts && timeDiffHours < maxHoursBetweenShifts) {
            return true;
        }
    }

    return false; 
}


function displayResults(employees) {
    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML = '<h2>Employees Meeting the Criteria:</h2>';

    if (employees.length === 0) {
        outputDiv.innerHTML += '<p>No employees meet the criteria.</p>';
    } else {
        employees.forEach(employee => {
            outputDiv.innerHTML += `<p>Name: ${employee[0]}, Position: ${employee[1]}</p>`;
        });
    }
}
