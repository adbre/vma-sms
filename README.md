# texttv-vma

Bevakar och loggar Viktigt Meddelande till Allmänheten (VMA)
som är utfärdade på SVT text tv [sida 599](https://texttv.nu/599).

Använder mig utav ett [REST API på texttv.nu](https://texttv.nu/blogg/texttv-api)
för att hämta text-tv sidorna.

Har lite idéer på hur jag skulle vilja använda VMA-meddelanden.
Men för det behöver jag samla in rådataexempel för att se hur
dessa meddelanden/sidor är formaterade. Så använder detta program
endast för dataloggning.

För att installera och köra

    npm install
    node ./index.js

För Windows finns en wrapper batch-fil

    run.bat

Vid (nya) viktiga meddelanden så sparas dessa till en json fil,
enligt följande exempel

    ./out/2016/12-December/2016-12-07T16.42.22+0100.json

För att identifiera nya/dubletter används `date_updated_unix`
flaggan. Ifall samma VMA har fått ny tidsstämpel så kommer
programmet se det som ett nytt VMA.

Dubletter skrivs ut i terminalen, men sparas inte på disk.
