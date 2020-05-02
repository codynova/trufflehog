module.exports = {
    escape: string => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    validEmailRegex: new RegExp(/^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i),
    fileExtensionRegex: new RegExp(/\.[0-9a-z]+$/i),
}