# Support Ticket System

An AI-powered Support Ticket System built with Django REST Framework, React, PostgreSQL, and Docker. This application allows users to submit support tickets, automatically categorizes and prioritizes them using a Large Language Model (LLM), and provides a real-time dashboard for viewing metrics and filtering tickets.

## 🚀 Setup Instructions

This project is fully containerized. You only need Docker and an API key to run it.

### Prerequisites
* Docker and Docker Compose installed on your machine.
* A Google Gemini API Key (or applicable LLM API key).

### Step-by-Step Guide

1. **Set up Environment Variables**
   Navigate to the `backend/` directory and create a `.env` file:
   ```bash
   cd backend
   touch .env