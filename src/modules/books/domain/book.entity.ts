export class Book {
    constructor(
        public readonly id: string,
        public title: string,
        public author: string,
        public readPages: number,
        public totalPages: number
    ) { }

    updatePages(pages: number) {
        if(pages < 0 || pages > this.totalPages) {
            throw new Error('Invalid page number')
        }
        this.totalPages = pages
    }
}
