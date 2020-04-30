module.exports = {
    escape: string => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    emailRegex: new RegExp(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/),
}