export class Message{
  constructor(
    public _id: string,
    public text: string,
    public viewer: string,
    public created_at: string,
    public emitter: string,
    public receiver: string
  ) {}
}
