# trufflehog

🐖 Search for new subreddit posts that match your criteria<br><br>


## Getting Started

1. Install:<br>
`npm i -g trufflehog`<br>

2. Run:<br>
`trufflehog`<br>

3. Respond to the prompts to configure trufflehog, or see the config options below.<br><br>


## Config Options

You can configure trufflehog by passing the filepath to the config file. Trufflehog accepts JSON and `.env` config files. If your config file is missing a setting that is required, trufflehog will prompt you for the setting.<br>


#### JSON

`trufflehog -c config.json` or `trufflehog --config config.json`

```json
{
    "subredditName": "news",
    "useBodySearch": true,
    "useRegex": true,
    "useCaseSensitive": true,
    "searchString": "[a-zA-Z]{2,4}",
    "pollingFrequency": 10,
    "useNotifications": false,
    "emailAddress": null,
    "emailPassword": null
}
```


#### .env

`trufflehog -c path/to/.env` or `trufflehog --config path/to/.env`

```
# The subreddit name to search in
subredditName=news

# Whether to search the post body in addition to the title
useBodySearch=true

# Whether to use regex or regular string for the search
useRegex=true

# Whether the search will be case-sensitive or not
useCaseSensitive=true

# The text or regex string to search for
searchString=[a-zA-Z]{2,4}

# How frequently to perform the search in seconds, between 1 and 86400
pollingFrequency=10

# Whether to receive email notifications when a match is found
useNotifications=false

# Email settings are only required when useNotifications=true
emailAddress=null
emailPassword=null
```
<br>

## To Do

* Add user notifications (Email, SMS, Push)
* Allow defining multiple search rules to match against
* Enable multiple search queries to run simultaneously
* Support searching other post types (not just new posts)
<br><br>