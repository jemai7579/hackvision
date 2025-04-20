// Chat Application Class
class VesosChat {
    constructor() {
      // Initialize elements and state
      this.currentChatId = null;
      this.chats = {};
      this.theme = 'light';
      
      // Initialize the app
      this.initElements();
      this.initTheme();
      this.initEventListeners();
      this.createNewChat();
    }
  
    // Initialize DOM elements
    initElements() {
      this.elements = {
        menuToggle: document.getElementById('menuToggle'),
        closeMenu: document.getElementById('closeMenu'),
        sideMenu: document.getElementById('sideMenu'),
        mainContent: document.getElementById('mainContent'),
        newChatBtn: document.getElementById('newChatBtn'),
        themeToggle: document.getElementById('themeToggle'),
        messageInput: document.getElementById('messageInput'),
        sendBtn: document.getElementById('sendBtn'),
        messageHistory: document.getElementById('messageHistory'),
        chatSection: document.getElementById('chatSection'),
        settingsSection: document.getElementById('settingsSection'),
        contactSection: document.getElementById('contactSection'),
        profileSection: document.getElementById('profileSection'),
        logoutSection: document.getElementById('logoutSection'),
        confirmLogout: document.getElementById('confirmLogout'),
        todaySection: document.querySelector('.menu-section:first-child'),
        yesterdaySection: document.querySelector('.menu-section:nth-child(2)')
      };
    }
  
    // Initialize theme from localStorage
    initTheme() {
      this.theme = localStorage.getItem('vesos-theme') || 'light';
      document.documentElement.setAttribute('data-theme', this.theme);
      this.updateThemeButton();
    }
  
    // Update theme toggle button icon
    updateThemeButton() {
      if (this.elements.themeToggle) {
        this.elements.themeToggle.textContent = this.theme === 'dark' ? '☀️' : '🌙';
      }
    }
  
    // Toggle between light/dark theme
    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', this.theme);
      localStorage.setItem('vesos-theme', this.theme);
      this.updateThemeButton();
    }
  
    // Initialize all event listeners
    initEventListeners() {
      // Sidebar toggle
      this.elements.menuToggle.addEventListener('click', () => this.toggleSidebar());
      this.elements.closeMenu.addEventListener('click', () => this.toggleSidebar());
  
      // New chat button
      this.elements.newChatBtn.addEventListener('click', () => this.createNewChat());
  
      // Theme toggle
      if (this.elements.themeToggle) {
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
      }
  
      // Chat message submission
      this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
      this.elements.messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.sendMessage();
      });
  
      // Navigation items
      document.querySelectorAll('[data-section]').forEach(item => {
        item.addEventListener('click', (e) => {
          const section = e.currentTarget.getAttribute('data-section');
          this.showSection(section);
          
          // If it's a chat item, load that chat
          if (e.currentTarget.classList.contains('menu-item')) {
            const chatId = e.currentTarget.dataset.chatId;
            if (chatId) this.loadChat(chatId);
          }
        });
      });
  
      // Logout confirmation
      if (this.elements.confirmLogout) {
        this.elements.confirmLogout.addEventListener('click', () => {
          alert('You have been logged out');
        });
      }
    }
  
    // Toggle sidebar visibility
    toggleSidebar() {
      this.elements.sideMenu.classList.toggle('active');
      this.elements.mainContent.classList.toggle('shifted');
    }
  
    // Show a specific content section
    showSection(section) {
      // Hide all sections
      document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
      });
  
      // Show the requested section
      const sectionElement = document.getElementById(`${section}Section`);
      if (sectionElement) {
        sectionElement.classList.add('active');
      }
  
      // Close sidebar on mobile
      if (window.innerWidth <= 768) {
        this.toggleSidebar();
      }
    }
  
    // Generate a unique chat ID
    generateChatId() {
      return Date.now().toString();
    }
  
    // Create a new chat conversation
    createNewChat() {
      const chatId = this.generateChatId();
      this.currentChatId = chatId;
  
      // Create new chat object
      this.chats[chatId] = {
        id: chatId,
        title: 'New Conversation',
        messages: [
          { sender: 'bot', content: 'Bienvenue chez VESOS !' }
        ],
        timestamp: Date.now()
      };
  
      // Update UI
      this.renderChatList();
      this.loadChat(chatId);
      this.showSection('chat');
    }
  
    // Render the chat list in the sidebar
    renderChatList() {
      // Clear existing chat items (except the first one which is the current chat)
      this.elements.todaySection.querySelectorAll('.menu-item:not(:first-child)').forEach(item => item.remove());
      this.elements.yesterdaySection.querySelectorAll('.menu-item').forEach(item => item.remove());
  
      // Sort chats by timestamp (newest first)
      const sortedChats = Object.values(this.chats).sort((a, b) => b.timestamp - a.timestamp);
  
      // Group by today/yesterday
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
  
      sortedChats.forEach(chat => {
        // Skip if this is the current chat (it's already shown)
        if (chat.id === this.currentChatId) return;
  
        const isToday = (now - chat.timestamp) < oneDay;
        const section = isToday ? this.elements.todaySection : this.elements.yesterdaySection;
  
        // Create chat item
        const chatItem = document.createElement('div');
        chatItem.className = 'menu-item';
        chatItem.dataset.section = 'chat';
        chatItem.dataset.chatId = chat.id;
        chatItem.innerHTML = `<span>${chat.title}</span>`;
  
        // Add click handler
        chatItem.addEventListener('click', () => {
          document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
          chatItem.classList.add('active');
          this.loadChat(chat.id);
        });
  
        section.appendChild(chatItem);
      });
    }
  
    // Load a specific chat into the view
    loadChat(chatId) {
      const chat = this.chats[chatId];
      if (!chat) return;
  
      this.currentChatId = chatId;
  
      // Clear message history
      this.elements.messageHistory.innerHTML = '';
  
      // Add all messages to the view
      chat.messages.forEach(message => {
        this.addMessage(message.content, message.sender === 'user');
      });
  
      // Update active state in sidebar
      document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.toggle('active', item.dataset.chatId === chatId);
      });
    }
  
    // Send a new message
    sendMessage() {
      const message = this.elements.messageInput.value.trim();
      if (!message) return;
  
      // Add to UI
      this.addMessage(message, true);
      this.elements.messageInput.value = '';
  
      // Add to current chat
      const chat = this.chats[this.currentChatId];
      chat.messages.push({
        sender: 'user',
        content: message,
        timestamp: Date.now()
      });
  
      // Update chat title if this is the first user message
      if (chat.messages.length === 2) {
        chat.title = message.length > 30 ? message.substring(0, 30) + '...' : message;
        this.renderChatList();
      }
  
      // Process the message and generate response
      this.generateResponse(message);
    }
  
    // Add a message to the chat UI
    addMessage(content, isUser) {
      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
      messageDiv.textContent = content;
      this.elements.messageHistory.appendChild(messageDiv);
      this.elements.messageHistory.scrollTop = this.elements.messageHistory.scrollHeight;
    }
  
    // Show typing indicator
    showTypingIndicator() {
      const typingDiv = document.createElement('div');
      typingDiv.className = 'message bot-message typing-indicator';
      typingDiv.innerHTML = '<span></span><span></span><span></span>';
      this.elements.messageHistory.appendChild(typingDiv);
      this.elements.messageHistory.scrollTop = this.elements.messageHistory.scrollHeight;
      return typingDiv;
    }
  
    // Generate a response to a user message with improved keyword detection
    generateResponse(message) {
      // Show typing indicator
      const typingIndicator = this.showTypingIndicator();
      
      setTimeout(() => {
        // Remove typing indicator
        if (typingIndicator && typingIndicator.parentNode) {
          typingIndicator.parentNode.removeChild(typingIndicator);
        }
        
        // Convert message to lowercase for easier comparison
        const lowerMessage = message.toLowerCase();
        let response;
        
        // Check for multiple keywords first
        if ((lowerMessage.includes('valeur') || lowerMessage.includes('valeurs')) && 
    (lowerMessage.includes('sos') || lowerMessage.includes('vesos'))) {
  response = ` l'association Tunisienne des villages d'enfants SOS (ATVESOS) a jugé utile de rappeler dans ce nouveau numéro les valeurs, les principes, et les fondamentaux de SOS villages d'enfants dans un objectif de rafraichir les mémoires et de ressusciter un retour aux sources.
  
Nos valeurs, nos missions et nos objectifs, tels qu'ils sont définis par l'organisation au double échelon national et international, constituent toujours un référentiel très utile dans la prise en charge de nos enfants dans les différents villages, les maisons intégrées et les foyers de jeunes`;
}
        else if ((lowerMessage.includes('aide') || lowerMessage.includes('help')) && 
                 (lowerMessage.includes('compte') || lowerMessage.includes('account'))) {
          response = "Pour l'aide concernant votre compte, vous pouvez :\n1. Vérifier vos paramètres\n2. Réinitialiser votre mot de passe\n3. Contacter le support";
        }
        else if ((lowerMessage.includes('bonjour') || lowerMessage.includes('salut')) && 
                 (lowerMessage.includes('aide') || lowerMessage.includes('help'))) {
          response = "Bonjour ! Bien sûr, je peux vous aider. Dites-moi ce dont vous avez besoin.";
        }
        // Single keyword cases
        else if (lowerMessage.includes('aide') || lowerMessage.includes('help')) {
          response = "Voici comment je peux vous aider :\n- Paramètres du compte\n- Problèmes techniques\n- Informations sur les fonctionnalités\n\nDe quoi avez-vous besoin ?";
        }
        else if (lowerMessage.includes('compte') || lowerMessage.includes('account')) {
          response = "Vous pouvez gérer vos paramètres de compte dans la section Profil.";
        }
        else if (lowerMessage.includes('problème') || lowerMessage.includes('problem') || 
                 lowerMessage.includes('bug') || lowerMessage.includes('erreur')) {
          response = "Pour signaler un problème technique, veuillez décrire l'erreur en détail et nous la contacter via la section Contact.";
        }
        else if (lowerMessage.includes('bonjour') || lowerMessage.includes('hello') || 
                 lowerMessage.includes('salut') || lowerMessage.includes('hi')) {
          response = "Bonjour ! Comment puis-je vous aider aujourd'hui ? 😊";
        }
        else if (lowerMessage.includes('merci') || lowerMessage.includes('thanks')) {
          response = "Je vous en prie ! N'hésitez pas si vous avez d'autres questions.";
        }
        else if (lowerMessage.includes('au revoir') || lowerMessage.includes('bye')) {
          response = "Au revoir ! À bientôt !";
        }
        else {
          response = "Merci pour votre message. Je vais faire de mon mieux pour vous aider.";
        }
        
        // Add response to UI
        this.addMessage(response, false);
        
        // Add response to chat history
        this.chats[this.currentChatId].messages.push({
          sender: 'bot',
          content: response,
          timestamp: Date.now()
        });
      }, 1500); // Simulate typing delay
    }
  }
  
  // Initialize the app when the DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    new VesosChat();
  });