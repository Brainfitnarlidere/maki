document.addEventListener('DOMContentLoaded', () => {
    // Scroll Reveal Animation
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.hero-content, .about-text, .about-img, .project-card, .contact-info');
    revealElements.forEach(el => observer.observe(el));

    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Mobile Menu
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('open');
        });

        // Linklere tıklandığında menünün otomatik kapanması için
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('open');
            });
        });
    }

    // Supabase Configuration
    const SUPABASE_URL = 'https://ppqaosszrhwwxmmwkllo.supabase.co';
    // ÖNEMLİ: Yeni projeniz olan 'ppqaosszrh' projesinin ANON KEY bilgisini de buraya yapıştırmalısınız.
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwcWFvc3N6cmh3d3htbXdrbGxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1Mjk1NDIsImV4cCI6MjA5MTEwNTU0Mn0.ounan13VP5Qmm5K-kiw8xC29FeLEPOVnf4xAjzj8EIQ';

    // Telefon Numarası Maskeleme (0XXX XXX XX XX formatı için)
    const phoneInput = document.querySelector('input[name="phone"]');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, ''); // Sadece rakamlar
            if (value.length > 0 && value[0] !== '0') {
                value = '0' + value; // Her zaman 0 ile başla
            }

            let formatted = '';
            if (value.length > 0) {
                formatted = value.substring(0, 4);
                if (value.length > 4) {
                    formatted += ' ' + value.substring(4, 7);
                }
                if (value.length > 7) {
                    formatted += ' ' + value.substring(7, 9);
                }
                if (value.length > 9) {
                    formatted += ' ' + value.substring(9, 11);
                }
            }
            e.target.value = formatted;
        });
    }

    // Check if supabase is defined (loaded from CDN)
    if (typeof supabase !== 'undefined') {
        const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        const volunteerForm = document.getElementById('volunteerForm');
        if (volunteerForm) {
            volunteerForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const submitBtn = volunteerForm.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.innerText;
                submitBtn.innerText = 'Gönderiliyor...';
                submitBtn.disabled = true;

                const formData = new FormData(volunteerForm);

                const selectedInterests = [];
                volunteerForm.querySelectorAll('input[name="interest"]:checked').forEach(cb => {
                    selectedInterests.push(cb.value);
                });

                // Get values manually
                const fullName = volunteerForm.querySelector('[name="fullName"]').value;
                const email = volunteerForm.querySelector('[name="email"]').value;
                const phone = volunteerForm.querySelector('[name="phone"]').value;
                const message = volunteerForm.querySelector('[name="message"]').value;

                // 1. Seçenek Kontrolü
                if (selectedInterests.length === 0) {
                    alert('Lütfen bize nasıl katılmak istediğinize dair en az bir seçenek işaretleyiniz.');
                    submitBtn.innerText = originalBtnText;
                    submitBtn.disabled = false;
                    return;
                }

                // 2. Telefon Numarası Tam Doluluk Kontrolü (Opsiyonel ama yazılmışsa tam olmalı)
                if (phone.length > 0 && phone.length < 14) {
                    alert('Lütfen telefon numaranızı eksiksiz giriniz (Örn: 0530 080 70 76).');
                    submitBtn.innerText = originalBtnText;
                    submitBtn.disabled = false;
                    return;
                }

                // 3. E-posta Geçerlilik Kontrolü (@ ve . kontrolü)
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(email)) {
                    alert('Lütfen geçerli bir e-posta adresi giriniz.');
                    submitBtn.innerText = originalBtnText;
                    submitBtn.disabled = false;
                    return;
                }

                const data = {
                    full_name: fullName,
                    email: email,
                    phone: phone,
                    interests: selectedInterests.join(', '),
                    message: message,
                    created_at: new Date().toISOString()
                };

                try {
                    const { error } = await supabaseClient
                        .from('volunteers')
                        .insert([data]);

                    if (error) throw error;

                    alert('Gönüllülük başvurunuz alınmıştır. İyiliğe katkınız için teşekkür ederiz!');
                    volunteerForm.reset();
                } catch (error) {
                    console.error('Hata:', error);
                    alert('Bir hata oluştu. Lütfen daha sonra tekrar deneyiniz veya iletişim kanallarımızdan bize ulaşın.');
                } finally {
                    submitBtn.innerText = originalBtnText;
                    submitBtn.disabled = false;
                }
            });
        }
    }
    else {
        console.error('Supabase library not loaded');
    }

    // Donation Link Alert
    const donateBtns = document.querySelectorAll('.btn-donate');
    donateBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const href = btn.getAttribute('href');
            if (!href || href === '#' || href.includes('fonzip')) {
                // If it's a mock or specific, we can let it be, but user wanted to check
            }
        });
    });
});
