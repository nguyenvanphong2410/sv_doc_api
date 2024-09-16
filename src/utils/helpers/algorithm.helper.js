
export const capitalizeFirstLetter = (str) => {
    const trimmedStr = str.trim();
    const formattedStr = trimmedStr.replace(/\s+/g, " ");
    return formattedStr.charAt(0).toUpperCase() + formattedStr.slice(1);
};
