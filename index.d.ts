declare namespace psp {
    interface result {
        crit: number;
        warn: number;
    }

    interface options {
        forceMode?: boolean;
        CWD?: string;
        isCLI?: boolean;
        verbose?: boolean;
    }
}

declare function psp(options?: psp.options): Promise<psp.result>;

export = psp;
export as namespace psp;
