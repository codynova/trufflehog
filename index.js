#!/usr/bin/env node

require('dotenv').config()
const Koa = require('koa')
const router = require('@koa/router')()
const logger = require('koa-logger')
const parser = require('koa-bodyparser')
const inquirer = require('inquirer')
const https = require('https')
const { cyan, magenta, red, yellow, bgGreen } = require('chalk')
const queries = require('./queries')
const { escape } = require('./regex')

const cols = process.stdout.columns

const init = ({ subredditName, pollingFrequency, searchString }) => {
    const app = new Koa()
    app.use(logger())
    app.use(parser())

    app.use(async (ctx, next) => {
        try {
            await next()
        }
        catch (error) {
            ctx.status = error.status || 500
            ctx.body = error.message
            ctx.app.emit('error', error, ctx)
        }
    })

    router.get('/', (ctx, next) => {
        ctx.body = `Trufflehog is searching /r/${subredditName} every ${pollingFrequency} seconds for ${searchString}`
    })

    app.use(router.routes())
    app.use(router.allowedMethods())

    app.listen(8080)
}

const request = async (method, url, options, data) => {
    return new Promise((resolve, reject) => {
        const httpsRequest = https.request(
            url,
            { ...options, method },
            response => {
                const chunks = []
                response.on('data', chunk => chunks.push(chunk))
                response.on('end', () => resolve(chunks.join('')))
            }
        ).on('error', error => resolve(error))
       
        if (method === 'POST' || method === 'post') {
            httpsRequest.write(data)
        }

        httpsRequest.end()
    })
}

const match = (posts, { searchString, useRegex, useCaseSensitive, useBodySearch }) => {
    let matches = []
    const regex = new RegExp(useRegex ? searchString : escape(searchString), useCaseSensitive ? 'g' : 'gi')
    posts.forEach(post => {
        if (regex.test(post['title'])) matches.push(post)
        else if (useBodySearch && regex.test(post['selftext'])) matches.push(post)
    })
    return matches
}

const notify = matches => { /* TO DO: implement notifications */ }

const highlight = (string, { searchString, useRegex, useCaseSensitive }, stringColor, highlightColor) =>
    stringColor(string.replace(new RegExp(useRegex ? searchString : escape(searchString), useCaseSensitive ? 'g' : 'gi'), match => highlightColor(match)))

const report = (matches, answers) => {
    console.log('\x1b[32m%s\x1b[0m', `\nSuccess! ${matches.length} matches found:\n\n`)
    console.log('─'.repeat(cols))
    console.log('\n')
    matches.forEach(({ title, selftext, url }) => {
        console.log(highlight(title, answers, cyan, bgGreen))
        console.log(magenta(url))
        console.log('\n')
        console.log(highlight(selftext, answers, yellow, bgGreen))
        console.log('\n')
        console.log('─'.repeat(cols))
        console.log('\n\n')
    })
}

let ready = true
let count = 1
let pollIntervalId = 0

const success = (matches, answers) => {
    clearInterval(pollIntervalId)
    notify(matches)
    report(matches, answers)
    process.exit(0)
}

const poll = async answers => {
    try {
        if (ready) {
            ready = false
            console.log(`${count}. Searching /r/${answers.subredditName} every ${answers.pollingFrequency} seconds for ${answers.searchString}`)
            const result = await request('GET', `https://www.reddit.com/r/${answers.subredditName}/new.json`)
            if (!result) throw new Error(red('The query did not return a result!'))
            const { data } = JSON.parse(result)
            if (!data) throw new Error(red('The result did not return any data!'))
            if (!data['children']) throw new Error(red('The data did not contain any posts!'))
            const posts = data['children'].map(item => item.data)
            const matches = match(posts, answers)
            count++
            if (matches.length) success(matches, answers)
            else ready = true
        }
    }
    catch (error) {
        console.error(red(error))
        process.exit(1)
    }
}

const propKeys = [
    'subredditName',
    'useBodySearch',
    'useRegex',
    'useCaseSensitive',
    'searchString',
    'pollingFrequency',
    'useNotifications',
    'emailAddress',
    'emailPassword',
]

const configure = () => {
    console.log('\n')
    const config = Object.assign({}, process.env)
    propKeys.forEach(key => {
        const value = config[key]
        if (typeof value === 'string' && value.length) {
            const lowercaseValue = value.toLowerCase()
            if (lowercaseValue === 'true' || lowercaseValue === 'false') config[key] = lowercaseValue === 'true' ? true : false
            else if (!isNaN(Number(value))) config[key] = Number(value)
            
        }
    })
    const configKeys = propKeys.filter(key => config.hasOwnProperty(key))
    if (configKeys.length) {
        console.log('Config file found with the following settings:\n')
        configKeys.forEach(key =>
            console.log(`${key}${yellow('=')}${cyan(key === 'emailPassword' ? '*'.repeat(config[key].length) : config[key])}`)
        )
        console.log('\n')
    }
    return config
}

const config = configure()
inquirer.prompt(queries(config)).then(async answers => {
    answers = Object.assign({}, config, answers)
    init(answers)
    console.log('\n')
    console.log('─'.repeat(cols))
    console.log('\n')
    poll(answers)
    pollIntervalId = setInterval(() => poll(answers), answers.pollingFrequency * 1000)
})