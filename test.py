import traceback
import sys
sys.path.insert(0, './project')
from services.analytics_service import get_summary_stats, get_charts_data

print("--- SUMMARY ---")
try:
    print(get_summary_stats())
except Exception as e:
    traceback.print_exc()

print("\n--- CHARTS ---")
try:
    print(get_charts_data())
except Exception as e:
    traceback.print_exc()
