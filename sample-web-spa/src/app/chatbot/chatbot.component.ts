import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

export interface IRetrieveWithTools {
  output: string
  actionLink: string
  takeAction: boolean
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.less'
})
export class ChatbotComponent {
  userMessage!: string;
  assistantReply!: string;
  chatMessages: { role: string, content: string }[] = [];

  constructor(private httpClient: HttpClient, private router: Router){}

  sendMessage() {
    const userMessage = this.userMessage;
    this.chatMessages.push({ role: 'user', content: userMessage });
    this.httpClient.post('http://localhost:8000/retrieve_with_tools', {
        "data": userMessage
      }).subscribe((response: any) => {
      if (response.actionLink && response.takeAction) {
        this.assistantReply = "Sure!. Taking you to " + response.actionLink;
      } else {
        this.assistantReply = response.output;
      }
      this.chatMessages.push({ role: 'assistant', content: this.assistantReply });
      this.userMessage = '';
      if (response.actionLink && response.takeAction) {
        this.router.navigateByUrl(response.actionLink);
      }
    });
    // this.httpClient.post('http://localhost:8000/retrieve', {
    //     "data": userMessage
    // }).subscribe((response: any) => {
    //   let isValidJson = true;
    //   try {
    //     response = JSON.parse(response);
    //   } catch(e) {
    //     isValidJson = false;
    //   }
    //   if (!isValidJson) {
    //     response = response;
    //   }
      
    //   if (response.actionLink && response.actionLink !== "") {
    //     this.assistantReply = "Sure!. Taking you to " + response.actionLink;
    //   } else if(response.output) {
    //     this.assistantReply = response.output;
    //   } else {
    //     this.assistantReply = response;
    //   }
    //   this.chatMessages.push({ role: 'assistant', content: this.assistantReply });
    //   this.userMessage = '';
    //   if (response.actionLink) {
    //     this.router.navigateByUrl(response.actionLink);
    //   }
    // });
  }
}
