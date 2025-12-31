import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatInputModule, MatCardModule],
  templateUrl: './chat-widget.html',
  styles: [`
    .chat-fab {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
    }
    .chat-container {
      position: fixed;
      bottom: 80px;
      right: 20px;
      width: 350px;
      height: 450px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      background: white;
      font-family: 'Roboto', sans-serif;
    }
    .chat-header {
      background-color: #007bff; /* Or theme color */
      color: white;
      padding: 10px 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: bold;
    }
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 10px;
      background-color: #f9f9f9;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .message {
      max-width: 80%;
      padding: 8px 12px;
      border-radius: 15px;
      font-size: 14px;
      line-height: 1.4;
    }
    .user-msg {
      align-self: flex-end;
      background-color: #e3f2fd;
      color: #333;
      border-bottom-right-radius: 2px;
    }
    .bot-msg {
      align-self: flex-start;
      background-color: #fff;
      border: 1px solid #ddd;
      color: #333;
      border-bottom-left-radius: 2px;
    }
    .chat-input {
      padding: 10px;
      border-top: 1px solid #eee;
      display: flex;
      gap: 5px;
      background: white;
    }
    .chat-input input {
      flex: 1;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 20px;
      outline: none;
    }
    .chat-input button {
      border-radius: 50%;
      min-width: 40px;
      width: 40px;
      height: 40px;
      padding: 0;
    }
    .loading-dots::after {
      content: ' .';
      animation: dots 1s steps(5, end) infinite;
    }
    @keyframes dots {
      0%, 20% { content: ' .'; }
      40% { content: ' ..'; }
      60% { content: ' ...'; }
      80%, 100% { content: ''; }
    }
  `]
})
export class ChatWidgetComponent {
  isOpen = false;
  messages: { sender: 'user' | 'bot', text: string }[] = [
    { sender: 'bot', text: 'Greetings! I am The Grand Hotelier. How may I assist you today?' }
  ];
  userInput = '';
  loading = false;

  constructor(private api: ApiService) { }

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  sendMessage() {
    if (!this.userInput.trim()) return;

    const text = this.userInput;
    this.messages.push({ sender: 'user', text });
    this.userInput = '';
    this.loading = true;

    this.api.chatWithAgent(text).subscribe({
      next: (res: any) => {
        this.messages.push({ sender: 'bot', text: res.reply });
        this.scrollToBottom();
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.messages.push({ sender: 'bot', text: 'My apologies, I seem to have lost my train of thought. Please try again.' });
        this.loading = false;
      }
    });

    this.scrollToBottom();
  }

  scrollToBottom() {
    setTimeout(() => {
      const el = document.querySelector('.chat-messages');
      if (el) el.scrollTop = el.scrollHeight;
    }, 100);
  }
}
