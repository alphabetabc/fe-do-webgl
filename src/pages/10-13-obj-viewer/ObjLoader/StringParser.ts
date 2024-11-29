class StringParser {
    str: string;
    index: any;
    constructor(str?: string) {
        this.str = str;
        this.init(str);
    }

    init = (str: string) => {
        this.str = str;
        this.index = 0;
    };

    skipDelimiters = () => {
        let i = this.index;
        const length = this.str.length;

        for (; i < length; i++) {
            const c = this.str.charAt(i);

            // Skip TAB, Space, '(', ')
            if (["\t", " ", "(", ")", `"`].includes(c)) {
                continue;
            } else {
                break;
            }
        }
        this.index = i;
    };

    skipToNextWord = () => {
        this.skipDelimiters();
        const n = getWordLength(this.str, this.index);
        this.index += n + 1;
    };

    getWord = () => {
        this.skipDelimiters();
        const n = getWordLength(this.str, this.index);
        if (n === 0) return null;
        const word = this.str.substring(this.index, this.index + n);
        this.index += n + 1;
        return word;
    };

    getInt = () => parseInt(this.getWord());

    getFloat = () => parseFloat(this.getWord());
}

function getWordLength(str: string, start: number) {
    let i = start;
    const len = str.length;
    for (; i < len; i++) {
        const c = str.charAt(i);
        if (["\t", " ", "(", ")", `"`].includes(c)) {
            break;
        }
    }
    return i - start;
}

export { StringParser };
