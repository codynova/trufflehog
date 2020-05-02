const { cyan, red } = require('chalk')
const { validEmailRegex } = require('./regex')

module.exports = ({
    subredditName,
    useBodySearch,
    useRegex,
    useCaseSensitive,
    searchString,
    pollingFrequency,
    useNotifications,
    emailAddress,
    emailPassword,
}) => [
    {
        type: 'input',
        name: 'subredditName',
        message: 'Name of Subreddit to watch:',
        when: subredditName === undefined,
        transformer: answer => cyan(`reddit.com/r/${answer}`),
        validate: answer => {
            if (answer === '') return red('Subreddit name cannot be empty.')
            else return true
        },
    },
    {
        type: 'confirm',
        name: 'useBodySearch',
        message: 'Search post body as well as title?',
        default: true,
        when: useBodySearch === undefined,
    },
    {
        type: 'confirm',
        name: 'useRegex',
        message: 'Use regex for search string?',
        default: true,
        when: useRegex === undefined,
    },
    {
        type: 'confirm',
        name: 'useCaseSensitive',
        message: 'Use case sensitivity for search string?',
        default: false,
        when: useCaseSensitive === undefined,
    },
    {
        type: 'input',
        name: 'searchString',
        when: searchString === undefined,
        message: ({ useRegex }) => `${useRegex ? 'Regex string' : 'String'} to search for:`,
        transformer: answer => cyan(answer),
        validate: answer => {
            if (answer === '') return red('Search string cannot be empty.')
            else return true
        },
    },
    {
        type: 'input',
        name: 'pollingFrequency',
        message: 'Frequency to check for updates in seconds:',
        default: 10,
        when: pollingFrequency === undefined,
        transformer: answer => cyan(answer),
        validate: answer => {
            answer = Number(answer)
            if (!isNaN(answer) && (answer < 1 || answer > 86400))
                return red('Frequency must be a number between 1 and 86400.')
            else return true
        },
    },
    {
        type: 'confirm',
        name: 'useNotifications',
        message: 'Do you want to receive email notifications?',
        default: true,
        when: useNotifications === undefined,
    },
    {
        type: 'input',
        name: 'emailAddress',
        message: 'Email address:',
        when: answers => (
            (useNotifications || answers.useNotifications)
            && (typeof emailAddress !== 'string' || emailAddress === '' || !validEmailRegex.test(emailAddress))
        ),
        transformer: answer => cyan(answer),
        validate: answer => {
            if (answer === '') return red('Email address cannot be empty.')
            else if (!validEmailRegex.test(answer))
                return red('Email address must be in a valid email format.')
            else return true
        },
    },
    {
        type: 'password',
        name: 'emailPassword',
        message: 'Email password:',
        when: answers => (
            (useNotifications || answers.useNotifications)
            && (typeof emailPassword !== 'string' || emailPassword === '')
        ),
        validate: answer => {
            if (answer === '') return red('Email password cannot be empty.')
            else return true
        },
    },
]