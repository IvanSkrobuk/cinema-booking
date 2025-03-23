document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('bookingForm');
    const seatsContainer = document.getElementById('seats');
    const status = document.getElementById('status');
    const loading = document.getElementById('loading');
    let selectedSeats = [];

    function generateSeats() {
        for (let row = 1; row <= 5; row++) {
            for (let col = 1; col <= 10; col++) {
                const seat = document.createElement('div');
                seat.classList.add('seat');
                seat.dataset.id = `${row}-${col}`;
                seat.textContent = `${row}${String.fromCharCode(64 + col)}`;
                seatsContainer.appendChild(seat);
            }
        }
    }

    seatsContainer.addEventListener('click', (e) => {
        const seat = e.target.closest('.seat');
        if (!seat || seat.classList.contains('taken')) return;

        seat.classList.toggle('selected');
        const seatId = seat.dataset.id;
        if (selectedSeats.includes(seatId)) {
            selectedSeats = selectedSeats.filter(id => id !== seatId);
        } else {
            selectedSeats.push(seatId);
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        status.textContent = '';

        const movie = document.getElementById('movie').value;
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;

        if (!movie || !date || !time) {
            status.textContent = 'Пожалуйста, заполните все поля!';
            return;
        }
        if (selectedSeats.length === 0) {
            status.textContent = 'Выберите хотя бы одно место!';
            return;
        }

        loading.classList.remove('hidden');

        try {
            const response = await fakeApiRequest({ movie, date, time, seats: selectedSeats });
            if (response.success) {
                status.textContent = `Забронированы места: ${selectedSeats.join(', ')}`;
                selectedSeats.forEach(id => {
                    const seat = document.querySelector(`[data-id="${id}"]`);
                    seat.classList.add('taken');
                    seat.classList.remove('selected');
                });
                selectedSeats = [];
            } else {
                status.textContent = 'Некоторые места уже заняты!';
            }
        } catch (err) {
            status.textContent = 'Произошла ошибка.';
        } finally {
            loading.classList.add('hidden');
        }
    });

    function fakeApiRequest(data) {
        return new Promise((resolve) => {
            setTimeout(() => resolve({ success: true }), 1500);
        });
    }

    generateSeats();
});
