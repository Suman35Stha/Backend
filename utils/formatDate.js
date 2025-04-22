const formatDate = (dateString) => {
    const date = new Date(dateString);
    
    // Format options for the date
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
    };
    
    // Format the date according to user's locale
    return date.toLocaleString(undefined, options);
};

export default formatDate;

// Example usage:
// const formattedDate = formatDate('2025-04-15T06:47:38.491+00:00');
// Output will be something like: "April 15, 2025, 12:47:38 PM EDT" (depending on user's timezone) 