# Github Slash Command for Mixmax

This is an open source Mixmax Slash Command. See <http://sdk.mixmax.com/docs/tutorial-giphy-slash-command> for more information about how to use this example code in Mixmax.

## Running locally

1. Install using `npm install`
2. Run using `npm start`

To simulate locally how Mixmax calls the typeahead URL (to return a JSON list of typeahead results), run:

```
curl https://localhost:9145/typeahead?text=leftpad
```

To simulate locally how Mixmax calls the resolver URL (to return HTML that goes into the email), run:

```
curl https://localhost:9145/resolver?text=leftpad
```
