# Libre Metro - Delhi Metro API Usage Guide

This project provides an easy way to interact with the Delhi Metro Shortest Path API through a built-in Next.js proxy route and a simple utility wrapper.

## How to Get the Shortest Route
To calculate the path between two stations, you can use the api/dmrc endpoint. You must specify the type as route and provide both a source and a destination station.

Example API URL for your test:
http://localhost:3001/api/dmrc?type=route&from=Tughlakabad&to=Vishwavidyalaya

This will return the travel time, the full path of stations, and any interchanges required for the journey.

## How to Get a List of Stations for a Line
To see all station names for a specific metro line, use the same api/dmrc endpoint but set the type to stations and provide a line name.

Example for Blue Line:
http://localhost:3001/api/dmrc?type=stations&line=blue

## Important Information about Station Names
When searching for routes, make sure to use the exact station names. The API is case-insensitive, but extra spaces should be avoided. For the best experience, reference the official station list.

## Core Features and Logic
The system automatically accounts for the 9-minute penalty during interchanges between different lines to accurately reflect real-world travel time.

## Setting up your Backend URL
Ensure your .env.local file is configured with the correct ngrok or localhost address for your Metro API backend using the API and NEXT_PUBLIC_METRO_API_URL variables.
