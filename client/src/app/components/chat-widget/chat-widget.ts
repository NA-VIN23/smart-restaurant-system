import { Component, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
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
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .chat-fab:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 16px rgba(0,0,0,0.2);
    }
    .chat-container {
      position: fixed;
      bottom: 90px;
      right: 24px;
      width: 380px;
      height: 500px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 12px 28px rgba(0,0,0,0.2);
      background: white;
      font-family: 'Inter', 'Roboto', sans-serif;
      animation: slideUp 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .chat-header {
      background: linear-gradient(135deg, #007bff 0%, #00d2ff 100%);
      color: white;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
      font-size: 1.1rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      background-color: #f0f2f5;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    /* Scrollbar styling */
    .chat-messages::-webkit-scrollbar {
      width: 6px;
    }
    .chat-messages::-webkit-scrollbar-thumb {
      background-color: rgba(0,0,0,0.1);
      border-radius: 3px;
    }
    .message {
      max-width: 80%;
      padding: 10px 16px;
      font-size: 14px;
      line-height: 1.5;
      position: relative;
      word-wrap: break-word;
      animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .user-msg {
      align-self: flex-end;
      background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
      color: white;
      border-radius: 18px 18px 2px 18px;
      box-shadow: 0 2px 4px rgba(0, 123, 255, 0.2);
    }
    .bot-msg {
      align-self: flex-start;
      background-color: #ffffff;
      color: #1c1e21;
      border-radius: 18px 18px 18px 2px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
      border: 1px solid #e4e6eb;
    }
    .chat-input {
      padding: 12px 16px;
      border-top: 1px solid #f0f0f0;
      display: flex;
      gap: 8px;
      background: white;
      align-items: center;
    }
    .chat-input input {
      flex: 1;
      padding: 10px 16px;
      border: 1px solid #ddd;
      border-radius: 24px;
      outline: none;
      transition: border-color 0.2s;
      background-color: #f0f2f5;
    }
    .chat-input input:focus {
      border-color: #007bff;
      background-color: #fff;
    }
    .chat-input button {
      border-radius: 50%;
      min-width: 44px;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s;
    }
    .loading-dots {
      padding: 12px 20px;
      color: #65676b;
      font-style: italic;
    }
    .loading-dots::after {
      content: ' .';
      animation: dots 1.5s steps(5, end) infinite;
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

  constructor(private api: ApiService, private cdr: ChangeDetectorRef, private ngZone: NgZone) { }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.scrollToBottom();
    }
  }

  sendMessage() {
    if (!this.userInput.trim()) return;

    const text = this.userInput;
    this.messages.push({ sender: 'user', text });
    this.userInput = '';
    this.loading = true;
    this.scrollToBottom();

    this.api.chatWithAgent(text).subscribe({
      next: (res: any) => {
        this.ngZone.run(() => {
          this.messages.push({ sender: 'bot', text: res.reply });
          this.loading = false;
          this.cdr.detectChanges();
          this.scrollToBottom();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          console.error(err);
          this.messages.push({ sender: 'bot', text: 'My apologies, I seem to have lost my train of thought. Please try again.' });
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  scrollToBottom() {
    setTimeout(() => {
      const el = document.querySelector('.chat-messages');
      if (el) el.scrollTop = el.scrollHeight;
    }, 100);
  }
}
