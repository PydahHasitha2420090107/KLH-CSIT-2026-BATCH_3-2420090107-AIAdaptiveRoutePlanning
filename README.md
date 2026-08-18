# AI-Based Adaptive Transport Route Planning System

## Team Details

| Name          | ID Number  |
| ------------- | ---------- |
| P. Hasitha Sai Keerthana | 2420090107 |
| C. Suma Priya | 2420030337  |
| L. Mrudani| 2420030591 |
| K.Tejaswi|2420030517|

---
Guided by: Mr. Rajkumar Patil



---

## Abstract

The AI-Based Adaptive Transport Route Planning System is an intelligent transportation solution designed to recommend efficient travel routes using Artificial Intelligence and Machine Learning. Unlike traditional route planning systems that primarily focus on the shortest distance, the proposed system considers multiple factors such as distance, traffic level, time of day, day of the week, weather conditions, and historical travel data.

The system uses a machine learning model to predict the estimated travel time for available routes and recommends the route with the most efficient predicted travel time. The application consists of a React.js frontend, Spring Boot backend, PostgreSQL database, and a Python FastAPI-based AI service using Scikit-learn. JWT authentication is used to provide secure user access.

The main objective of the system is to provide adaptive and intelligent route recommendations that can help users reduce travel time and select more efficient transportation routes.

---

## Objectives

* Develop an AI-based transport route planning system.
* Predict estimated travel time using machine learning.
* Recommend the most efficient route based on predicted travel time.
* Consider traffic, distance, time, and other contextual factors.
* Provide a simple and user-friendly web interface.
* Implement secure user authentication.
* Maintain route and travel information using a relational database.

---

## Key Features

* User registration and login
* JWT-based authentication
* Source and destination input
* Route selection and comparison
* AI-based travel time prediction
* Traffic-aware route recommendation
* Estimated Time of Arrival (ETA) prediction
* Route history
* User dashboard

---

## Technologies Used

| Technology   | Purpose                          |
| ------------ | -------------------------------- |
| React.js     | Frontend and user interface      |
| Spring Boot  | Backend and REST APIs            |
| PostgreSQL   | Database                         |
| Python       | AI/ML development                |
| FastAPI      | AI service and API               |
| Scikit-learn | Machine learning model           |
| JWT          | Authentication and authorization |
| GitHub       | Version control                  |

---

## AI Component

The AI component uses machine learning to predict travel time based on factors such as:

* Distance
* Traffic level
* Time of day
* Day of week
* Weather conditions
* Historical travel time

The predicted travel time is then used to compare available routes and recommend the most efficient route.

### AI Workflow

```text
Transport Data
      ↓
Data Preprocessing
      ↓
Feature Selection
      ↓
Machine Learning Model
      ↓
Predicted Travel Time
      ↓
Route Comparison
      ↓
Best Route Recommendation
```

---

## System Architecture

```text
                    User
                     ↓
                React.js
                     ↓
              Spring Boot API
                ↙          ↘
        PostgreSQL       FastAPI
                            ↓
                       ML Model
                     (Scikit-learn)
                            ↓
                  Travel Time Prediction
                            ↓
                    Route Recommendation
```

## Expected Outcome

The completed system will provide users with an intelligent route planning platform that predicts travel time and recommends an efficient route using machine learning. The system aims to improve route selection by considering multiple transportation factors rather than relying only on shortest-distance calculations.

---

## Future Enhancements

* Real-time traffic data integration
* Live map integration
* Weather API integration
* Advanced machine learning models
* Mobile application
* Real-time route updates
* Integration with public transportation data

---

