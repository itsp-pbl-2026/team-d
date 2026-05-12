class UpcomingEvent{

    #id:string;
    #title:string;
    #description:string;
    #start_at:Date;
    #end_at:Date;

    constructor(id: string, title: string, description: string, start_at: Date, end_at: Date){
        this.#id = id;
        this.#title = title;
        this.#description = description;
        this.#start_at = start_at;
        this.#end_at = end_at;
    }
    getId(): string{
        return this.#id;
    }
    getTitle(): string{
        return this.#title;
    }
    getDescription(): string{
        return this.#description;
    }
    getStartAt(): Date{
        return this.#start_at;
    }
    getEndAt(): Date{
        return this.#end_at;
    }
}