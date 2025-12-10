document.addEventListener('DOMContentLoaded', () => {
    // Шукаємо контейнер одразу. Якщо його немає - далі йти сенсу немає.
    const container = document.getElementById('results-row');
    if (!container) {
        console.error("Помилка: Не знайдено елемент з id='results-row'");
        return;
    }

    try {
        // --- 1. Вхідні константи (Варіант 9) ---
        const Z = 1.32;
        const X_START = -1;
        const X_END = 1;
        const DX = 0.2;
        const Y_START = -2;
        const Y_END = 2;
        const DY = 0.2;

        // --- 2. Математичні функції ---
        const calculateB = (x, y, z) => {
            // Уникаємо ділення на нуль
            if (Math.abs(x) < 0.00001) return null;
            
            // Перевірка знаменника в тангенсі (2x - 1.4)
            if (Math.abs(2 * x - 1.4) < 0.00001) return null;

            const term1InsideAbs = (Math.pow(Math.abs(z), 0.3)) / x;
            const tanArg = (x + Math.pow(z, 2)) / (2 * x - 1.4);
            const tanPart = Math.pow(Math.tan(tanArg), 2);
            
            const mainAbs = Math.abs(term1InsideAbs + tanPart);
            // Корінь кубічний (Math.pow(..., 1/3))
            const rootPart = Math.pow(mainAbs, 1/3); 
            
            const term2 = z * Math.exp(Math.pow(x, 2) - y);
            
            return (y * rootPart) - term2;
        };

        const calculateA = (x, y, z, bVal) => {
            const numeratorTerm2 = Math.exp(y - x);
            const absForSqrt = Math.abs(Math.pow(y, 2) + bVal);
            const numeratorTerm3 = Math.sqrt(Math.pow(absForSqrt, 0.3));
            const numerator = 3 + numeratorTerm2 + numeratorTerm3;
            
            const tanZ2 = Math.pow(Math.tan(z * z), 2);
            const denominatorPart = Math.abs(y - tanZ2);
            const denominator = 1 + (Math.pow(x, 2) * denominatorPart);
            
            if (Math.abs(denominator) < 0.00001) return null;

            return numerator / denominator;
        };

        // --- 3. Цикли ---
        const tableDataB = [];
        const tableDataA = [];
        
        // Використовуємо Math.round для уникнення помилок float (0.2 + 0.2 = 0.400000001)
        const stepsX = Math.round((X_END - X_START) / DX);
        const stepsY = Math.round((Y_END - Y_START) / DY);

        for (let i = 0; i <= stepsX; i++) {
            let x = X_START + i * DX;
            
            for (let j = 0; j <= stepsY; j++) {
                let y = Y_START + j * DY;
                
                let bVal = calculateB(x, y, Z);
                let aVal = null;

                // Перевіряємо bVal на валідність перед розрахунком A
                if (bVal !== null && !isNaN(bVal) && isFinite(bVal)) {
                    aVal = calculateA(x, y, Z, bVal);
                } else {
                    bVal = null; // Маркуємо як помилку для виводу
                }

                // Форматування результату
                const format = (val) => (val !== null && isFinite(val)) ? val.toFixed(4) : "Error";
                
                tableDataB.push({ x: x.toFixed(1), y: y.toFixed(1), res: format(bVal) });
                tableDataA.push({ x: x.toFixed(1), y: y.toFixed(1), res: format(aVal) });
            }
        }

        // --- 4. Генерація HTML ---
        const createCard = (title, data, color) => {
            let rows = data.map(r => `
                <tr class="${r.res === 'Error' ? 'table-danger' : ''}">
                    <td>${r.x}</td>
                    <td>${r.y}</td>
                    <td><b>${r.res}</b></td>
                </tr>
            `).join('');

            return `
            <div class="col-md-6">
                <div class="card border-${color} mb-3">
                    <div class="card-header bg-${color} text-white">${title}</div>
                    <div class="card-body p-0">
                        <div style="max-height: 300px; overflow-y: auto;">
                            <table class="table table-striped mb-0 text-center">
                                <thead><tr><th>x</th><th>y</th><th>Result</th></tr></thead>
                                <tbody>${rows}</tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>`;
        };

        // Вставка в HTML
        container.innerHTML = createCard('Функція B', tableDataB, 'success') + 
                              createCard('Функція A', tableDataA, 'primary');

    } catch (err) {
        // ЯКЩО СТАЛАСЯ ПОМИЛКА - ВОНА БУДЕ ТУТ
        console.error(err);
        container.innerHTML = `
            <div class="alert alert-danger text-center">
                <h4>Сталася помилка в JavaScript!</h4>
                <p>${err.name}: ${err.message}</p>
                <small>Перевірте консоль (F12) для деталей.</small>
            </div>
        `;
    }
});