document.addEventListener('DOMContentLoaded', function() {
    initPageNavigation();
    initSwiper();
    initChat();
    initMobileMenu();
});

function initPageNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            const targetPageId = link.getAttribute('data-page');
            switchPage(targetPageId);
        });
    });
}

function switchPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
        if (page.id === pageId) {
            page.classList.add('active');
        }
    });
}

function initSwiper() {
    new Swiper('.swiper', {
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        effect: 'fade',
        fadeEffect: {
            crossFade: true
        }
    });
}

function initChat() {
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.querySelector('.send-button');
    const clearButton = document.querySelector('.clear-chat');
    const messageArea = document.getElementById('messageArea');
    
    if (!chatInput || !sendButton || !clearButton || !messageArea) {
        console.error('Chat elements not found');
        return;
    }

    loadChatHistory();
    
    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;
        
        addMessage(message, 'user');
        chatInput.value = '';
        
        const loadingId = showLoading();
        
        try {
            const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer b2af72465d5bb3036d86be7aa988affd.Ui2nXRgWGZhbm5Ls'
                },
                body: JSON.stringify({
                    model: "glm-4",
                    messages: [
                        {
                            role: "user",
                            content: message
                        }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            hideLoading(loadingId);
            addMessage(data.choices[0].message.content, 'ai');
            
        } catch (error) {
            console.error('Error:', error);
            hideLoading(loadingId);
            addMessage('抱歉，发生了一些错误，请稍后重试。', 'ai');
        }
        
        saveChatHistory();
    }
    
    function showLoading() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message message-ai loading';
        loadingDiv.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
        messageArea.appendChild(loadingDiv);
        messageArea.scrollTop = messageArea.scrollHeight;
        return loadingDiv.id = 'loading-' + Date.now();
    }
    
    function hideLoading(loadingId) {
        const loadingDiv = document.getElementById(loadingId);
        if (loadingDiv) {
            loadingDiv.remove();
        }
    }
    
    function addMessage(content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        
        if (type === 'ai') {
            messageDiv.innerHTML = marked.parse(content);
            messageDiv.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        } else {
            messageDiv.textContent = content;
        }
        
        messageArea.appendChild(messageDiv);
        messageArea.scrollTop = messageArea.scrollHeight;
    }
    
    function saveChatHistory() {
        const messages = Array.from(messageArea.children)
            .filter(msg => !msg.classList.contains('loading'))
            .map(msg => ({
                content: msg.innerHTML,
                type: msg.classList.contains('message-user') ? 'user' : 'ai'
            }));
        localStorage.setItem('chatHistory', JSON.stringify(messages));
    }
    
    function loadChatHistory() {
        const history = localStorage.getItem('chatHistory');
        if (history) {
            const messages = JSON.parse(history);
            messages.forEach(msg => {
                const messageDiv = document.createElement('div');
                messageDiv.className = `message message-${msg.type}`;
                messageDiv.innerHTML = msg.content;
                messageArea.appendChild(messageDiv);
            });
            messageArea.scrollTop = messageArea.scrollHeight;
        }
    }
    
    function clearChat() {
        if (confirm('确定要清空所有聊天记录吗？')) {
            messageArea.innerHTML = '';
            localStorage.removeItem('chatHistory');
        }
    }
    
    sendButton.addEventListener('click', sendMessage);
    
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    clearButton.addEventListener('click', clearChat);
}

function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
        
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }
} 