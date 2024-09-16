export function generateRandomCode(length) {
    const result = Array.from({length}, () => Math.floor(Math.random() * 10)).join("");
    return result;
}
