document.addEventListener('DOMContentLoaded', () => {
    const ratingModal = document.getElementById('rating-modal');
    if (!ratingModal) return; 

    const openModalBtns = document.querySelectorAll('#rate-project-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const ratingForm = document.getElementById('rating-form');
    const ratingMessage = document.getElementById('rating-message');
    const ratingUserInput = document.getElementById('rating-user');

    // --- Твой ID от Formspree УЖЕ ВСТАВЛЕН ---
    const FORMSPREE_ID = "xdkwdovk";
    if (ratingForm) {
        ratingForm.action = `https://formspree.io/f/${FORMSPREE_ID}`;
    }

    const showModal = () => {
        ratingModal.classList.remove('rating-modal-hidden');
        ratingModal.classList.add('rating-modal-visible');
        // Сброс формы при открытии
        if(ratingForm) ratingForm.reset();
        if(ratingMessage) ratingMessage.textContent = '';
    };

    const hideModal = () => {
        ratingModal.classList.remove('rating-modal-visible');
        ratingModal.classList.add('rating-modal-hidden');
    };

    openModalBtns.forEach(btn => btn.addEventListener('click', showModal));
    if (closeModalBtn) closeModalBtn.addEventListener('click', hideModal);
    window.addEventListener('click', (event) => {
        if (event.target === ratingModal) hideModal();
    });

    if (ratingForm) {
        ratingForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            if (!formData.get('rating')) {
                ratingMessage.textContent = "Пожалуйста, выберите оценку.";
                ratingMessage.style.color = "#f87171";
                return;
            }
            ratingMessage.textContent = "Отправка...";
            ratingMessage.style.color = "#fbbf24";

            try {
                const response = await fetch(this.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });
                if (response.ok) {
                    ratingMessage.textContent = "Спасибо за вашу оценку!";
                    ratingMessage.style.color = "#34d399";
                    setTimeout(() => {
                        hideModal();
                        if (window.currentUser) {
                             localStorage.setItem(`projectRated_${window.currentUser.username}`, 'true');
                        }
                    }, 2000);
                } else {
                    throw new Error('Network response was not ok.');
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                ratingMessage.textContent = "Ошибка отправки. Попробуйте снова.";
                ratingMessage.style.color = "#f87171";
            }
        });
    }
    
    // Этот код выполняется после того, как script.js определил window.currentUser
    function setupUserDependentFeatures() {
        if (window.currentUser && ratingUserInput) {
            ratingUserInput.value = window.currentUser.username;
        }
        // Автоматический показ окна оценки через 30 секунд
        const pagePath = window.location.pathname;
        if ((pagePath.includes('index.html') || pagePath === '/') && window.currentUser && !localStorage.getItem(`projectRated_${window.currentUser.username}`)) {
            setTimeout(() => {
                const usage = JSON.parse(localStorage.getItem(`quoteUsage_${window.currentUser.username}`)) || { count: 0 };
                if (usage.count > 5) {
                    showModal();
                }
            }, 30000);
        }
    }
    
    // Ждем, пока `currentUser` будет определен в `script.js`
    if (window.currentUser) {
        setupUserDependentFeatures();
    } else {
        // Если script.js загружается с задержкой, ждем события `load`
        window.addEventListener('load', setupUserDependentFeatures);
    }
});