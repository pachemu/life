export interface EmailSender {
  sendEmail(message: string, email: string): Promise<void>;
}
