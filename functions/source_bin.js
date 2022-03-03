const axios = require("axios");
const { languages } = require("@sourcebin/linguist");

/**
 * 
 * @param {string} code The code to be posted.
 * @param {Object} [options] The options for the source code.
 * @param {string} [options.title] Bin title.
 * @param {string} [options.description] Bin description.
 * @param {string} [options.language] Bin language. (This can either be a language code or the name of the language)
 * @param {string} [options.fileName] Bin file name.
 */
module.exports = async function createBin(code, options = {}) {

    if (options && typeof options != "object") throw new Error("Provided options is not an object.");

    const language = options.language;
    const title = options.title || "";
    const description = options.description || "";
    const fileName = options.fileName || "";

    let languageId;
    if (language) {
        let _language = Object.keys(languages).find((lang) => lang.toLowerCase() === language?.toLowerCase()) || Object.values(languages).find((lang) => lang === language);
        if (!_language) languageCode = "R";
        languageId = Object.values(languages)[Object.keys(languages).findIndex((lang) => lang === _language)]
    };

    const body = {
        title,
        description,
        files: [{
            content: code,
            languageId,
            name: fileName
        }]
    };
    const { data } = await axios({
        url: "https://sourceb.in/api/bins",
        method: "POST",
        data: body
    });

    return {
        url: `https://sourceb.in/${data.key}`,
        shortUrl: `https://srcb.in/${data.key}`,
        code: data.key,
        data: body
    };

};