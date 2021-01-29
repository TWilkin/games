export {};

declare global {
    interface String {
        isNullOrWhitespace(): boolean;
    }
}

String.prototype.isNullOrWhitespace = function(): boolean {
    const str = String(this);
    return !str || str?.trim() === '';
};
