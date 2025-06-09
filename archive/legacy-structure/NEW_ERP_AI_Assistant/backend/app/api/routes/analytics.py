"""
API Router dla analytics i dashboard
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import logging
from datetime import datetime, timedelta
import random

from ...services.database_service import DatabaseService
from ...dependencies import get_db_service

logger = logging.getLogger(__name__)

router = APIRouter()

# Pydantic models
class DashboardStats(BaseModel):
    """Model statystyk dashboard"""
    total_users: int
    total_documents: int
    total_projects: int
    total_chat_interactions: int
    active_projects: int
    completed_projects: int

class ProjectMetric(BaseModel):
    """Model metryki projektu"""
    id: int
    project_name: str
    client_name: str
    status: str
    progress_percentage: float
    budget: Optional[float]
    team_size: int
    risk_level: str
    start_date: Optional[str]
    updated_at: str

@router.get("/dashboard/stats")
async def get_dashboard_stats(
    db_service: DatabaseService = Depends(get_db_service)
):
    """
    Endpoint do pobierania głównych statystyk dashboard
    """
    try:
        logger.info("📊 Pobieranie statystyk dashboard...")
        
        stats = await db_service.get_dashboard_stats()
        
        return DashboardStats(**stats)
        
    except Exception as e:
        logger.error(f"❌ Błąd pobierania statystyk dashboard: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Błąd podczas pobierania statystyk: {str(e)}"
        )

@router.get("/projects/metrics")
async def get_projects_metrics(
    consultant_id: Optional[str] = None,
    db_service: DatabaseService = Depends(get_db_service)
):
    """
    Endpoint do pobierania metryk projektów
    """
    try:
        logger.info(f"📈 Pobieranie metryk projektów dla konsultanta: {consultant_id}")
        
        projects = await db_service.get_project_metrics(consultant_id=consultant_id)
        
        return {
            "projects": projects,
            "count": len(projects),
            "consultant_id": consultant_id
        }
        
    except Exception as e:
        logger.error(f"❌ Błąd pobierania metryk projektów: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Błąd podczas pobierania metryk projektów: {str(e)}"
        )

@router.get("/projects/progress")
async def get_projects_progress(
    db_service: DatabaseService = Depends(get_db_service)
):
    """
    Endpoint do pobierania postępu projektów (dla wykresów)
    """
    try:
        logger.info("📊 Pobieranie danych postępu projektów...")
        
        projects = await db_service.get_project_metrics()
        
        # Grupowanie według statusu
        status_counts = {}
        progress_data = []
        
        for project in projects:
            status = project["status"]
            status_counts[status] = status_counts.get(status, 0) + 1
            
            progress_data.append({
                "name": project["project_name"][:20] + "..." if len(project["project_name"]) > 20 else project["project_name"],
                "progress": project["progress_percentage"],
                "budget": project["budget"] or 0,
                "risk": project["risk_level"]
            })
        
        return {
            "status_distribution": status_counts,
            "progress_data": progress_data,
            "total_projects": len(projects)
        }
        
    except Exception as e:
        logger.error(f"❌ Błąd pobierania postępu projektów: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Błąd podczas pobierania postępu projektów: {str(e)}"
        )

@router.get("/chat/analytics")
async def get_chat_analytics(
    days: int = 30,
    db_service: DatabaseService = Depends(get_db_service)
):
    """
    Endpoint do pobierania analytics dla chat
    """
    try:
        logger.info(f"💬 Pobieranie analytics chat za ostatnie {days} dni...")
        
        # Przykładowe dane analytics dla chat
        # W rzeczywistej aplikacji te dane byłyby pobierane z bazy
        
        # Generowanie przykładowych danych dla wykresów
        chat_analytics = {
            "total_interactions": 1247,
            "avg_response_time": 0.85,
            "user_satisfaction": 4.2,
            "daily_interactions": [
                {"date": (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d"), 
                 "count": random.randint(30, 80)} 
                for i in range(days-1, -1, -1)
            ],
            "top_topics": [
                {"topic": "Konfiguracja ERP", "count": 234, "percentage": 18.8},
                {"topic": "Migracja danych", "count": 187, "percentage": 15.0},
                {"topic": "Szkolenia użytkowników", "count": 156, "percentage": 12.5},
                {"topic": "Integracje", "count": 143, "percentage": 11.5},
                {"topic": "Raporty", "count": 125, "percentage": 10.0}
            ],
            "satisfaction_distribution": {
                "5": 45,
                "4": 35,
                "3": 15,
                "2": 3,
                "1": 2
            }
        }
        
        return chat_analytics
        
    except Exception as e:
        logger.error(f"❌ Błąd pobierania analytics chat: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Błąd podczas pobierania analytics chat: {str(e)}"
        )

@router.get("/performance/metrics")
async def get_performance_metrics():
    """
    Endpoint do pobierania metryk wydajności systemu
    """
    try:
        logger.info("⚡ Pobieranie metryk wydajności...")
        
        # Przykładowe metryki wydajności
        performance_metrics = {
            "system_health": {
                "status": "healthy",
                "uptime": "99.8%",
                "cpu_usage": 23.5,
                "memory_usage": 67.2,
                "disk_usage": 45.8
            },
            "api_performance": {
                "avg_response_time": 0.85,
                "requests_per_minute": 145,
                "error_rate": 0.2,
                "success_rate": 99.8
            },
            "rag_performance": {
                "avg_embedding_time": 0.12,
                "avg_search_time": 0.43,
                "avg_generation_time": 1.23,
                "knowledge_base_size": "2.4 GB"
            },
            "database_performance": {
                "connection_pool_usage": 15,
                "avg_query_time": 0.045,
                "active_connections": 8,
                "total_queries_today": 3247
            }
        }
        
        return performance_metrics
        
    except Exception as e:
        logger.error(f"❌ Błąd pobierania metryk wydajności: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Błąd podczas pobierania metryk wydajności: {str(e)}"
        )

@router.get("/roi/calculator")
async def get_roi_analysis():
    """
    Endpoint do analizy ROI projektów ERP
    """
    try:
        logger.info("💰 Pobieranie analizy ROI...")
        
        # Przykładowa analiza ROI
        roi_analysis = {
            "summary": {
                "total_investment": 450000,
                "estimated_savings_yearly": 180000,
                "roi_percentage": 40.0,
                "payback_period_months": 30,
                "npv": 234500
            },
            "cost_breakdown": [
                {"category": "Licencje oprogramowania", "amount": 150000, "percentage": 33.3},
                {"category": "Usługi wdrożeniowe", "amount": 180000, "percentage": 40.0},
                {"category": "Szkolenia", "amount": 45000, "percentage": 10.0},
                {"category": "Infrastruktura", "amount": 75000, "percentage": 16.7}
            ],
            "savings_breakdown": [
                {"category": "Automatyzacja procesów", "amount": 72000, "percentage": 40.0},
                {"category": "Redukcja błędów", "amount": 36000, "percentage": 20.0},
                {"category": "Oszczędność czasu", "amount": 45000, "percentage": 25.0},
                {"category": "Lepsze raportowanie", "amount": 27000, "percentage": 15.0}
            ],
            "projected_savings": [
                {"year": 1, "savings": 120000, "cumulative": 120000},
                {"year": 2, "savings": 180000, "cumulative": 300000},
                {"year": 3, "savings": 220000, "cumulative": 520000},
                {"year": 4, "savings": 240000, "cumulative": 760000},
                {"year": 5, "savings": 260000, "cumulative": 1020000}
            ]
        }
        
        return roi_analysis
        
    except Exception as e:
        logger.error(f"❌ Błąd pobierania analizy ROI: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Błąd podczas pobierania analizy ROI: {str(e)}"
        )

@router.get("/reports/export")
async def export_analytics_report(
    report_type: str = "dashboard",
    format: str = "json"
):
    """
    Endpoint do eksportu raportów analytics
    """
    try:
        logger.info(f"📋 Eksport raportu typu: {report_type}, format: {format}")
        
        # Podstawowe dane raportu
        report_data = {
            "report_type": report_type,
            "generated_at": datetime.now().isoformat(),
            "format": format,
            "data": {
                "summary": "Raport analytics dla ERP AI Assistant",
                "period": "Ostatnie 30 dni",
                "total_users": 42,
                "total_interactions": 1247,
                "success_rate": 98.5
            }
        }
        
        if format.lower() == "csv":
            # Tutaj byłaby logika generowania CSV
            return {
                "message": "Raport CSV został wygenerowany",
                "download_url": f"/downloads/report_{report_type}_{datetime.now().strftime('%Y%m%d')}.csv"
            }
        
        return report_data
        
    except Exception as e:
        logger.error(f"❌ Błąd eksportu raportu: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Błąd podczas eksportu raportu: {str(e)}"
        )
