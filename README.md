# 🔐 Confidante
Share your environment files through password managers

## Quick Start

```bash
npx confidante --help
```

## Usage

### Push an environment file to your password manager

```bash
npx confidante push [FILEPATH] [ENTRYNAME] [-a <adapter>] [-v <vault>]
```

> For all available arguments and flags type `npx confidante push --help`

### Pull an environment file from your password manager

```bash
npx confidante pull [FILEPATH] [ENTRYNAME] [-a <adapter>] [-v <vault>]
```

> For all available arguments and flags type `npx confidante pull --help`

## Available adapters

- 1Password: To use this adapter, you need to install the [1Password CLI](https://1password.com/downloads/command-line/) and setup either [Manual login](https://developer.1password.com/docs/cli/sign-in-manually) or [Biometric unlock](https://developer.1password.com/docs/cli/about-biometric-unlock)

## Shared configuration

You can use a shared configuration to omit command arguments.<br>
Create a file named `.confidante.json` at the root of your project and add the following content:

```json
{
  "adapter": "<adapter name>",
  "vault": "<vault name>",
  "filePath": "<file path of your environment, ie: .env>",
  "entryName": "<name of the entry in the password manager>"
}
```

> You can also automatically generate the file when running the pull command with the -s or --save flag.

Then your commands will be as simple as
  
```bash
npx confidante push
npx confidante pull
```

## Examples

Push a `.env` file to the password manager

```bash
npx confidante push .env "Local .env" -a 1password -v "My project"
````

Push a Rails `application.yml` to the password manager

```bash
npx confidante push config/application.yml "Rails application.yml" -a 1password -v "My project"
```

## License

[MIT](https://opensource.org/licenses/MIT)
