# Local Weather and Nearest Airport App

This app provides you with the current weather based on your location and displays the closest airport to you using your city name. It interacts with the backend to fetch weather data, reverse geocoding to determine your city, and airport information.

## User Guide

### 1. Accessing the App
   - Open the app in your web browser.

### 2. Granting Location Permission
   - Upon loading, the app will prompt you to allow access to your location.
   - Click **"Allow"** to grant permission.

### 3. Viewing the Weather and Nearest Airport Information
   - The app will fetch your geographic coordinates.
   - It will communicate with the backend to retrieve the current weather data.
   - It will use reverse geocoding to determine your city based on your coordinates.
   - Using your city name, it will fetch the nearest airport information.
   - A loading indicator will be displayed while fetching the data.

### 4. Information Displayed
   - Once the data is retrieved, the app will display the following information:
     1. **Current Weather**
        - Temperature
        - Feels Like Temperature
        - Humidity
        - Wind Speed and Direction
        - Cloud Coverage
        - Maximum and Minimum Temperatures
     2. **Nearest Airport**
        - Airport Name
        - Airport Code (IATA and ICAO)
        - City and Country
        - Distance from your location

### 5. Refreshing the Data
   - Click the **"Refresh"** button to update the weather and airport information.
   - The app will re-fetch your location and retrieve the latest data.

### 6. Handling Errors
   - If there's an error retrieving your location or fetching the data, an error message will be displayed.
   - You can click **"Try Again"** to retry the operation.
   - If the city name cannot be determined automatically, you will be prompted to enter your city manually.

### 7. Responsive Design
   - The app is optimized for all screen sizes and provides a user-friendly experience on both desktop and mobile devices.

**Note:** Please ensure that your browser has location services enabled and that you allow the app to access your location for it to function properly.
