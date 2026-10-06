# AI-Based Predictive and Adaptive Transport Fleet Management System

## Local Runtime Notes

The current runnable implementation is a React/Vite frontend with an Express/TypeScript and SQLite backend. For local development, set `VITE_API_BASE_URL=http://localhost:5000/api` and `VITE_USE_MOCK_API=false` in the frontend `.env`. The backend uses `backend/.env` for its own server configuration and Groq credentials; backend secrets must never be placed in frontend variables.

### Interactive Route Maps

The frontend uses Leaflet with OpenStreetMap tiles for road route visualization. Pickup and destination addresses are geocoded with the public OpenStreetMap/Nominatim service and then drawn as route markers plus an actual road path from OSRM when available. SmartFleet's Dijkstra graph remains a separate algorithmic recommendation; its graph distance/time is displayed alongside the real-road geometry but does not replace the public road geometry measurement. A current vehicle marker is only drawn when actual coordinates are supplied.

When geocoding or the public route service is unavailable, the map panels show a clear status message and continue to render the route markers without pretending that a synthetic line is a real road route.

### SQLite Upgrades and Demo Records

On non-production startup, schema changes are applied additively to the existing SQLite file and the idempotent development seed restores missing linked demo rows using `INSERT OR IGNORE`; the database is not deleted or recreated. Production startup does not seed demo data. The seed includes customer, driver, vehicle, shipment, trip, notification, and maintenance examples across several local logistics types.

Recent audited gaps addressed in code include signed-JWT verification for refresh, role/ownership checks on shipment and trip operations, manager-only fleet inventory/analytics, driver-specific vehicle access, per-user notification receipts, and atomic assignment across shipment, driver, vehicle, and trip records.

Some pages outside the customer/driver/manager dashboard, customer shipment flow, manager core rosters, notifications, and route optimization still require separate functional validation before the whole project can be declared complete. Mock fixtures are only used when `VITE_USE_MOCK_API=true`.

## Team Details

| Name                     | ID Number  |
| ------------------------ | ---------- |
| P. Hasitha Sai Keerthana | 2420090107 |
| C. Suma Priya            | 2420030337 |
| L. Mrudani               | 2420030591 |
| K. Tejaswi               | 2420030517 |

---

Guided by: Mr. Rajkumar Patil

---

## Abstract

The AI-Based Predictive and Adaptive Transport Fleet Management System is an intelligent fleet management solution designed to improve vehicle utilization, route efficiency, and operational decision-making using Artificial Intelligence and Machine Learning. Unlike conventional fleet management systems that mainly depend on static routes and manual vehicle allocation, the proposed system analyzes multiple transportation factors to provide intelligent and adaptive recommendations.

The system considers information such as vehicle details, capacity, availability, location, distance, traffic conditions, fuel consumption, historical travel data, and maintenance information. Machine learning models are used to predict travel time, fuel consumption, vehicle performance, and potential maintenance requirements. Based on these predictions, the system recommends suitable vehicles and efficient routes according to current transportation requirements.

The system consists of a React.js frontend, Spring Boot backend, PostgreSQL database, and a Python FastAPI-based AI service using Scikit-learn. The AI component performs data preprocessing, predictive analysis, and adaptive decision-making to support intelligent fleet operations.

The main objective of the system is to reduce travel time and fuel consumption, improve vehicle utilization, support predictive maintenance, and provide data-driven recommendations for efficient transport fleet management.

---

## Objectives

* To develop an AI-based predictive and adaptive transport fleet management system.
* To predict estimated travel time using machine learning.
* To recommend efficient routes based on predicted travel conditions.
* To intelligently allocate suitable vehicles based on capacity, availability, distance, and performance.
* To predict fuel consumption and identify factors affecting transportation efficiency.
* To predict potential vehicle maintenance requirements using historical vehicle data.
* To consider traffic, distance, time, weather, and historical transportation data.
* To provide a simple and user-friendly web interface for fleet management.
* To maintain vehicle, route, trip, and maintenance information using a relational database.
* To support data-driven decision-making for efficient fleet operations.

---

## Key Features

* User registration and login
* JWT-based authentication
* Vehicle information management
* Vehicle availability tracking
* Source and destination input
* Route selection and comparison
* AI-based travel time prediction
* Adaptive route recommendation
* Intelligent vehicle allocation
* Traffic-aware route planning
* ETA prediction
* Fuel consumption prediction
* Predictive vehicle maintenance
* Route and trip history
* Fleet management dashboard
* AI-based operational recommendations

---

## System Users

The system can support different roles involved in fleet operations.

### 1. Fleet Manager

The fleet manager oversees the overall fleet and uses AI-generated recommendations for vehicle allocation, route planning, and fleet performance analysis.

### 2. Vehicle Information Manager

A designated user or fleet administrator is responsible for entering and updating vehicle information such as:

* Vehicle number
* Vehicle type
* Vehicle capacity
* Fuel type
* Fuel efficiency
* Current availability
* Vehicle location
* Maintenance history

This ensures that the AI system has updated vehicle information before generating recommendations.

### 3. Driver

The driver receives the assigned vehicle and recommended route and can provide trip-related information such as actual travel time, distance, and fuel consumption.

### 4. System/User

Users can enter transportation requirements such as source, destination, and required capacity and receive AI-based route and vehicle recommendations.

---

## AI Component

The core of the system is the Artificial Intelligence and Machine Learning component. It analyzes historical and current transportation data to generate predictions and recommendations.

### AI Tasks

The system can perform the following AI-based tasks:

#### 1. Travel Time Prediction

Predicts the expected travel time for a route using:

* Distance
* Traffic level
* Time of day
* Day of week
* Weather conditions
* Historical travel time

#### 2. Adaptive Route Recommendation

Available routes are evaluated using predicted travel time and contextual transportation factors. The system recommends the route that provides the most suitable predicted outcome rather than simply selecting the shortest-distance route.

#### 3. Intelligent Vehicle Allocation

The system evaluates available vehicles based on:

* Vehicle capacity
* Availability
* Current location
* Distance to pickup point
* Fuel efficiency
* Vehicle performance
* Maintenance status

The AI system then recommends the most suitable vehicle for the requested trip.

#### 4. Fuel Consumption Prediction

The system predicts expected fuel consumption based on factors such as:

* Distance
* Vehicle type
* Fuel efficiency
* Traffic conditions
* Historical fuel consumption
* Route characteristics

#### 5. Predictive Maintenance

Historical vehicle information can be analyzed to identify vehicles that may require maintenance. This can help reduce unexpected breakdowns and improve fleet availability.

---

## AI Workflow

```text
Vehicle & Transport Data
          ↓
     Data Collection
          ↓
    Data Preprocessing
          ↓
     Feature Selection
          ↓
     ML Model Training
          ↓
   Model Prediction
          ↓
 ┌────────┼───────────┐
 ↓        ↓           ↓
Travel   Fuel      Maintenance
Time     Usage     Prediction
 ↓        ↓           ↓
 └────────┼───────────┘
          ↓
 Intelligent Decision Making
          ↓
Vehicle + Route Recommendation
          ↓
      Fleet Manager
```

---

## Route Planning Workflow

```text
Source + Destination + Trip Requirements
                  ↓
          Available Routes
                  ↓
       Transportation Factors
                  ↓
          AI Prediction Model
                  ↓
       Predicted Travel Time
                  ↓
          Route Comparison
                  ↓
       Recommended Route
```

---

## Vehicle Allocation Workflow

```text
Trip Requirements
       ↓
Available Vehicles
       ↓
Capacity & Availability Check
       ↓
Distance & Location Analysis
       ↓
Fuel Efficiency Analysis
       ↓
Maintenance Status
       ↓
AI-Based Evaluation
       ↓
Recommended Vehicle
```

---

## System Architecture

```text
                         User
                           ↓
                     React.js
                    Frontend UI
                           ↓
                  Spring Boot Backend
                    REST APIs
                   ↙          ↘
            PostgreSQL       FastAPI
             Database        AI Service
                               ↓
                        Python ML Models
                         (Scikit-learn)
                               ↓
                  ┌────────────┼────────────┐
                  ↓            ↓            ↓
             Travel Time   Fuel Usage   Maintenance
              Prediction   Prediction   Prediction
                  ↓            ↓            ↓
                  └────────────┼────────────┘
                               ↓
                   Intelligent Decision
                        & Recommendation
                               ↓
                  Route + Vehicle Selection
```

---

## Technologies Used

| Technology   | Purpose                          |
| ------------ | -------------------------------- |
| React.js     | Frontend and user interface      |
| Spring Boot  | Backend and REST APIs            |
| PostgreSQL   | Relational database              |
| Python       | AI/ML development                |
| FastAPI      | AI service and model APIs        |
| Scikit-learn | Machine learning models          |
| JWT          | Authentication and authorization |
| GitHub       | Version control                  |

---

## Database Information

The PostgreSQL database stores the information required for fleet management and AI analysis.

Possible entities include:

* Users
* Vehicles
* Drivers
* Trips
* Routes
* Traffic Data
* Weather Data
* Fuel Consumption
* Maintenance Records
* Prediction Results

Historical records can be used as training data for the machine learning models.

---

## Machine Learning Approach

The AI module follows a machine learning pipeline:

```text
Historical Fleet Data
        ↓
Data Cleaning
        ↓
Feature Engineering
        ↓
Train-Test Split
        ↓
Model Training
        ↓
Model Evaluation
        ↓
Prediction
        ↓
Recommendation
```

Possible machine learning approaches include:

* Linear Regression
* Random Forest Regression
* Decision Tree
* Gradient Boosting
* Other suitable regression or classification models

The final model can be selected based on evaluation metrics such as:

* MAE
* MSE
* RMSE
* R² Score
* Accuracy, where applicable

---

## Expected Outcome

The completed system will provide an intelligent fleet management platform capable of predicting transportation outcomes and generating adaptive recommendations. Instead of relying only on fixed rules or shortest-distance routes, the system will use historical and contextual data to support decisions related to route selection, vehicle allocation, fuel consumption, and maintenance.

The expected benefits include:

* Reduced travel time
* Reduced fuel consumption
* Better vehicle utilization
* Improved route selection
* Early identification of maintenance requirements
* Improved fleet availability
* Data-driven fleet management
* Adaptive transportation decision-making

---

## Project Scope

The primary focus of this project is Artificial Intelligence and Machine Learning applied to transport fleet management.

The project includes:

* Data collection and preprocessing
* Machine learning model development
* Predictive analytics
* Route optimization and recommendation
* Vehicle allocation
* Fuel consumption prediction
* Predictive maintenance
* AI-based decision support

DevOps tools such as Docker, Kubernetes, Jenkins, Prometheus, and Grafana are not part of the core project scope. The emphasis is on developing and demonstrating the AI-based predictive and adaptive capabilities of the fleet management system.

---

## Future Enhancements

* Real-time GPS tracking
* Real-time traffic data integration
* Live weather API integration
* Advanced deep learning models
* Reinforcement learning for dynamic route optimization
* Mobile application for drivers
* Real-time fleet monitoring
* Integration with IoT vehicle sensors
* Large-scale fleet data analysis
* Cloud-based AI model deployment
* Automated model retraining using new trip data

---

## Conclusion

The AI-Based Predictive and Adaptive Transport Fleet Management System demonstrates the application of Artificial Intelligence and Machine Learning to real-world transportation challenges. By combining predictive models with fleet and transportation data, the system can provide intelligent recommendations for route selection, vehicle allocation, fuel management, and predictive maintenance.

The proposed solution aims to make fleet operations more efficient, adaptive, and data-driven while providing a practical platform for applying AI techniques to modern transportation management.
