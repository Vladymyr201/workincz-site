/**
 * Система реферальных программ для привлечения пользователей
 * Поддерживает реферальные коды, отслеживание конверсий и автоматические выплаты
 */

class ReferralSystem {
    constructor() {
        this.currentUser = null;
        this.referralCode = null;
        this.init();
    }

    async init() {
        // Получаем реферальный код из URL
        this.referralCode = this.getReferralCodeFromURL();
        
        // Инициализируем UI
        this.initReferralUI();
        
        // Загружаем статистику рефералов
        await this.loadReferralStats();
    }

    getReferralCodeFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('ref') || urlParams.get('referral');
    }

    initReferralUI() {
        // Создаем кнопку "Пригласить друга" в навигации
        this.createInviteButton();
        
        // Создаем модальное окно для реферальной программы
        this.createReferralModal();
        
        // Добавляем реферальный код в форму регистрации
        this.addReferralToRegistration();
    }

    createInviteButton() {
        const nav = document.querySelector('nav') || document.querySelector('.navbar');
        if (!nav) return;

        const inviteBtn = document.createElement('button');
        inviteBtn.className = 'btn btn-primary btn-sm';
        inviteBtn.innerHTML = '<i class="fas fa-gift"></i> Пригласить друга';
        inviteBtn.onclick = () => this.showReferralModal();
        
        nav.appendChild(inviteBtn);
    }

    createReferralModal() {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'referralModal';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">🎁 Реферальная программа</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h6>Ваша реферальная ссылка</h6>
                                <div class="input-group mb-3">
                                    <input type="text" class="form-control" id="referralLink" readonly>
                                    <button class="btn btn-outline-secondary" type="button" onclick="referralSystem.copyReferralLink()">
                                        <i class="fas fa-copy"></i>
                                    </button>
                                </div>
                                
                                <h6>Ваш реферальный код</h6>
                                <div class="input-group mb-3">
                                    <input type="text" class="form-control" id="referralCode" readonly>
                                    <button class="btn btn-outline-secondary" type="button" onclick="referralSystem.copyReferralCode()">
                                        <i class="fas fa-copy"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <h6>Статистика рефералов</h6>
                                <div id="referralStats">
                                    <div class="d-flex justify-content-between">
                                        <span>Всего приглашено:</span>
                                        <span id="totalInvited">0</span>
                                    </div>
                                    <div class="d-flex justify-content-between">
                                        <span>Зарегистрировалось:</span>
                                        <span id="totalRegistered">0</span>
                                    </div>
                                    <div class="d-flex justify-content-between">
                                        <span>Заработано:</span>
                                        <span id="totalEarned">0 ₽</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mt-4">
                            <h6>Как это работает</h6>
                            <div class="row">
                                <div class="col-md-4 text-center">
                                    <div class="card">
                                        <div class="card-body">
                                            <i class="fas fa-share-alt fa-2x text-primary mb-2"></i>
                                            <h6>1. Поделитесь ссылкой</h6>
                                            <small>Отправьте друзьям вашу реферальную ссылку</small>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4 text-center">
                                    <div class="card">
                                        <div class="card-body">
                                            <i class="fas fa-user-plus fa-2x text-success mb-2"></i>
                                            <h6>2. Друг регистрируется</h6>
                                            <small>По вашей ссылке регистрируется новый пользователь</small>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4 text-center">
                                    <div class="card">
                                        <div class="card-body">
                                            <i class="fas fa-gift fa-2x text-warning mb-2"></i>
                                            <h6>3. Получаете бонус</h6>
                                            <small>500 ₽ за каждого приглашенного агентства</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    addReferralToRegistration() {
        const registrationForm = document.querySelector('#registrationForm') || 
                                document.querySelector('form[data-form="registration"]');
        
        if (!registrationForm) return;

        const referralField = document.createElement('div');
        referralField.className = 'mb-3';
        referralField.innerHTML = `
            <label for="referralCode" class="form-label">Реферальный код (необязательно)</label>
            <input type="text" class="form-control" id="referralCode" name="referralCode" 
                   placeholder="Введите код друга" value="${this.referralCode || ''}">
        `;

        // Вставляем поле перед кнопкой отправки
        const submitBtn = registrationForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.parentNode.insertBefore(referralField, submitBtn);
        }
    }

    async generateReferralCode() {
        if (!this.currentUser) return null;

        const code = `${this.currentUser.uid.slice(0, 8)}${Date.now().toString(36)}`.toUpperCase();
        
        try {
            await firebase.firestore().collection('referrals').doc(this.currentUser.uid).set({
                code: code,
                userId: this.currentUser.uid,
                userEmail: this.currentUser.email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                invitedUsers: [],
                totalEarned: 0
            });
            
            return code;
        } catch (error) {
            console.error('Ошибка создания реферального кода:', error);
            return null;
        }
    }

    async loadReferralStats() {
        if (!this.currentUser) return;

        try {
            const doc = await firebase.firestore().collection('referrals').doc(this.currentUser.uid).get();
            
            if (doc.exists) {
                const data = doc.data();
                document.getElementById('referralLink').value = `${window.location.origin}?ref=${data.code}`;
                document.getElementById('referralCode').value = data.code;
                document.getElementById('totalInvited').textContent = data.invitedUsers?.length || 0;
                document.getElementById('totalRegistered').textContent = data.registeredUsers?.length || 0;
                document.getElementById('totalEarned').textContent = `${data.totalEarned || 0} ₽`;
            } else {
                // Создаем реферальный код если его нет
                const code = await this.generateReferralCode();
                if (code) {
                    document.getElementById('referralLink').value = `${window.location.origin}?ref=${code}`;
                    document.getElementById('referralCode').value = code;
                }
            }
        } catch (error) {
            console.error('Ошибка загрузки статистики рефералов:', error);
        }
    }

    async processReferralRegistration(userId, referralCode) {
        if (!referralCode) return;

        try {
            // Находим пользователя с этим реферальным кодом
            const referralQuery = await firebase.firestore().collection('referrals')
                .where('code', '==', referralCode.toUpperCase())
                .limit(1)
                .get();

            if (!referralQuery.empty) {
                const referralDoc = referralQuery.docs[0];
                const referralData = referralDoc.data();

                // Обновляем статистику реферала
                await referralDoc.ref.update({
                    invitedUsers: firebase.firestore.FieldValue.arrayUnion(userId),
                    lastInvitedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                // Создаем запись о реферале
                await firebase.firestore().collection('referralRegistrations').add({
                    referrerId: referralData.userId,
                    referredUserId: userId,
                    referralCode: referralCode,
                    registeredAt: firebase.firestore.FieldValue.serverTimestamp(),
                    status: 'registered'
                });

                // Отправляем уведомление рефералу
                await this.sendReferralNotification(referralData.userId, userId);
            }
        } catch (error) {
            console.error('Ошибка обработки реферальной регистрации:', error);
        }
    }

    async sendReferralNotification(referrerId, referredUserId) {
        try {
            await firebase.firestore().collection('notifications').add({
                userId: referrerId,
                type: 'referral',
                title: 'Новый реферал!',
                message: 'По вашей ссылке зарегистрировался новый пользователь',
                data: {
                    referredUserId: referredUserId
                },
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                read: false
            });
        } catch (error) {
            console.error('Ошибка отправки уведомления:', error);
        }
    }

    async awardReferralBonus(referrerId, referredUserId) {
        try {
            const bonus = 500; // 500 рублей за агентство

            // Обновляем баланс реферала
            await firebase.firestore().collection('users').doc(referrerId).update({
                balance: firebase.firestore.FieldValue.increment(bonus)
            });

            // Обновляем статистику рефералов
            await firebase.firestore().collection('referrals').doc(referrerId).update({
                totalEarned: firebase.firestore.FieldValue.increment(bonus),
                registeredUsers: firebase.firestore.FieldValue.arrayUnion(referredUserId)
            });

            // Создаем транзакцию
            await firebase.firestore().collection('transactions').add({
                userId: referrerId,
                type: 'referral_bonus',
                amount: bonus,
                description: 'Бонус за реферала',
                data: {
                    referredUserId: referredUserId
                },
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Отправляем уведомление о бонусе
            await this.sendBonusNotification(referrerId, bonus);
        } catch (error) {
            console.error('Ошибка начисления реферального бонуса:', error);
        }
    }

    async sendBonusNotification(userId, amount) {
        try {
            await firebase.firestore().collection('notifications').add({
                userId: userId,
                type: 'referral_bonus',
                title: 'Реферальный бонус!',
                message: `Вам начислен бонус ${amount} ₽ за приглашенного пользователя`,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                read: false
            });
        } catch (error) {
            console.error('Ошибка отправки уведомления о бонусе:', error);
        }
    }

    copyReferralLink() {
        const link = document.getElementById('referralLink');
        link.select();
        document.execCommand('copy');
        this.showToast('Ссылка скопирована!', 'success');
    }

    copyReferralCode() {
        const code = document.getElementById('referralCode');
        code.select();
        document.execCommand('copy');
        this.showToast('Код скопирован!', 'success');
    }

    showReferralModal() {
        const modal = new bootstrap.Modal(document.getElementById('referralModal'));
        modal.show();
    }

    showToast(message, type = 'info') {
        // Создаем toast уведомление
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        const container = document.querySelector('.toast-container') || document.body;
        container.appendChild(toast);
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        // Удаляем toast после скрытия
        toast.addEventListener('hidden.bs.toast', () => {
            container.removeChild(toast);
        });
    }
}

// Инициализация системы рефералов
let referralSystem;

document.addEventListener('DOMContentLoaded', () => {
    referralSystem = new ReferralSystem();
});

// Экспорт для использования в других модулях
window.referralSystem = referralSystem; 