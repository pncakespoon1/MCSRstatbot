# MCSRstatbot

## Setup

Invite the bot to your server with this [link](https://discord.com/oauth2/authorize?client_id=1151605577265451128&scope=bot&permissions=274877910016)

## Usage

There are two slash commands

### Command 1

name: `/overview`<br>

description: This command returns a basic overview which includes only the most important metrics. <br>

arguments:
- `runner` must be a spreadsheet id or the name of a runner. If the runner's name doesn't work, DM pncakespoon#4895 on discord and request for your sheet link to be put into our database.
- `session` must be either "latest" or "all".

stats:
- `RNPH` or realtime nethers per hour, measures the frequency at which you enter the nether. Note that, while it does count time spent on wall or in world generation, it does not count nether time or break time.
- `LNPH` or legacy nethers per hour, also measures the frequency at which you enter the nether. However, it only counts time spent in the overworld. It does not  count time spent on wall or in the nether.
- `Enter avg` is the average of your nether enter times.
- `Playtime` is the amount of time spent excluding wall time.
- `Seeds Played %` is the percentage of seeds that are not instantly reset (0.0 second RTA).
- `Reset Count` is the amount of resets.

### Command 2

name: `/split`<br>

description: This command returns detailed information about the runner's data regarding a particular split, or segment of the run.<br>

arguments:
- `runner` must be a spreadsheet id or the name of a runner. If the runner's name doesn't work, DM pncakespoon#4895 on discord and request for your sheet link to be put into our database.
- `session` must be either "latest" or "all".
- `split` must be `Iron`, `Wood`, `Iron Pickaxe`, `Nether`, `Bastion`, `Fortress`, `Nether Exit`, `Stronghold`, or `End`. Note that `Bastion` refers to structure 1, and `Fortress` refers to structure 2.

stats:
- `Count` is the number of times you reached that split
- `Count per hour` is the frequency at which you acheived that split. Time spent after achieving the split will not affect the calculation.
- `C avg` or cumulative average, is the average time at which you achieve that split.
- `R avg` or relative average, is the average time with respect to the previous split.
- `C conversion` is the percentage of all resets that make it to the selected split.
- `R conversion` is the conversion rate with respect to the previous split.
- `C stdev` or cumulative standard deviation, is the standard deviation of the cumulative split distribution.
- `R stdev` or relative standard deviation, is the standard deviation of the relative split distribution.