document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('bookingForm');
    const movieSelect = document.getElementById('movie');
    const dateInput = document.getElementById('date');
    const timeSelect = document.getElementById('time');
    const seatsContainer = document.getElementById('seats');
    const status = document.getElementById('status');
    const loading = document.getElementById('loading');
    let selectedSeats = [];
    let bookings = [];

    async function loadBookings() {
        showLoading();
        try {
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error(`Не удалось загрузить data.json. Статус: ${response.status}`);
            }
            const data = await response.json();
            console.log('Необработанные данные из JSON:', data);
            bookings = data.bookings || [];
            const storedBookings = JSON.parse(localStorage.getItem('bookings')) || [];
            bookings = [...bookings, ...storedBookings];
            console.log('Все бронирования (JSON + localStorage):', bookings);
            status.textContent = `Данные загружены (${bookings.length} записей)`;
        } catch (error) {
            status.textContent = 'Ошибка загрузки data.json. Проверьте консоль.';
            console.error('Ошибка:', error);
        } finally {
            hideLoading();
        }
    }

    function generateSeats(takenSeats = []) {
        seatsContainer.innerHTML = '';
        console.log('Передано занятых мест в generateSeats:', takenSeats); // Отладка
        for (let row = 1; row <= 5; row++) {
            for (let col = 1; col <= 10; col++) {
                const seatId = `${row}${String.fromCharCode(64 + col)}`;
                const seat = document.createElement('div');
                seat.classList.add('seat');
                seat.dataset.id = seatId;
                seat.textContent = seatId;
                if (takenSeats.includes(seatId)) {
                    console.log(`Место ${seatId} занято`); // Отладка
                    seat.classList.add('taken');
                }
                seatsContainer.appendChild(seat);
            }
        }
        if (takenSeats.length === 0) {
            console.log('Нет занятых мест для отображения');
        }
    }

    function updateSeats() {
        const movie = movieSelect.value;
        const date = dateInput.value;
        const time = timeSelect.value;
        console.log('Выбранные значения:', { movie, date, time }); // Отладка
        if (!movie || !date || !time) {
            status.textContent = 'Выберите фильм, дату и время для отображения мест';
            seatsContainer.innerHTML = '';
            return;
        }

        const filteredBookings = bookings.filter(b => {
            const match = b.movie === movie && b.date === date && b.time === time;
            console.log(`Проверка: movie=${b.movie}, date=${b.date}, time=${b.time} -> Совпадение: ${match}`);
            return match;
        });
        console.log('Отфильтрованные бронирования:', filteredBookings); // Отладка

        const takenSeats = filteredBookings.flatMap(b => b.seats);
        console.log('Занятые места для генерации:', takenSeats); // Отладка
        generateSeats(takenSeats);
        status.textContent = takenSeats.length > 0 ? `Занято мест: ${takenSeats.length}` : 'Места не найдены для этой комбинации';
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

        const movie = movieSelect.value;
        const date = dateInput.value;
        const time = timeSelect.value;

        if (!movie || !date || !time) {
            status.textContent = 'Пожалуйста, заполните все поля!';
            return;
        }
        if (selectedSeats.length === 0) {
            status.textContent = 'Выберите хотя бы одно место!';
            return;
        }

        showLoading();
        try {
            const takenSeats = bookings
                .filter(b => b.movie === movie && b.date === date && b.time === time)
                .flatMap(b => b.seats);
            const overlap = selectedSeats.some(seat => takenSeats.includes(seat));

            if (overlap) {
                status.textContent = 'Некоторые места уже заняты!';
            } else {
                const newBooking = { movie, date, time, seats: [...selectedSeats] };
                bookings.push(newBooking);
                const storedBookings = JSON.parse(localStorage.getItem('bookings')) || [];
                storedBookings.push(newBooking);
                localStorage.setItem('bookings', JSON.stringify(storedBookings));
                status.textContent = `Забронированы места: ${selectedSeats.join(', ')}`;
                selectedSeats.forEach(id => {
                    const seat = document.querySelector(`[data-id="${id}"]`);
                    seat.classList.add('taken');
                    seat.classList.remove('selected');
                });
                selectedSeats = [];
            }
        } catch (error) {
            status.textContent = 'Произошла ошибка при бронировании';
            console.error(error);
        } finally {
            hideLoading();
        }
    });

    movieSelect.addEventListener('change', updateSeats);
    dateInput.addEventListener('change', updateSeats);
    timeSelect.addEventListener('change', updateSeats);

    function showLoading() {
        loading.classList.remove('hidden');
    }

    function hideLoading() {
        loading.classList.add('hidden');
    }

    loadBookings().then(() => updateSeats());
});