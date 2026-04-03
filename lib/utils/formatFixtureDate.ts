export function formatFixtureDate (dateString: string) {
    if(!dateString){
        return "TBD"
    }

    const date = new Date(dateString);
    const tommorrow = new Date();
    const today = new Date();

    tommorrow.setDate(today.getDate() + 1)

    const time = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

     const isTommorrow = date.toDateString() === tommorrow.toDateString()
    const isToday = date.toDateString() === today.toDateString()

    if(isToday) return `Today . ${time}`
    if(isTommorrow) return `Tommorrow ${time}`

    const day = date.toLocaleDateString([], {
        weekday: "short",
        day: "numeric",
        month: "short"

    });

    return `${day}`


} 