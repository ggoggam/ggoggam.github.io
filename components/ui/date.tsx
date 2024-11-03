import { format } from "date-fns";

type DateProps = {
    date: string;
}

export default function Date({ date }: DateProps) {
    console.log(typeof(date))
    return (
        <time dateTime={date}>{format(date, "LLLL   d, yyyy")}</time>
    )
}