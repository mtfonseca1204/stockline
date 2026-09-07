"""UTC windows from Nasdaq's published 2026 schedule, America/New_York DST."""
from datetime import date, datetime, time, timedelta
from zoneinfo import ZoneInfo
import json
from pathlib import Path
holidays = {date(2026,9,7), date(2026,11,26), date(2026,12,25)}
early = {date(2026,11,27), date(2026,12,24)}
day = date(2026,9,1)
rows = []
while day <= date(2026,12,31):
    if day.weekday() < 5 and day not in holidays:
        start = datetime.combine(day,time(9,30),ZoneInfo('America/New_York'))
        end = datetime.combine(day,time(13 if day in early else 16),ZoneInfo('America/New_York'))
        rows.append({'date':str(day),'open':int(start.timestamp()),'close':int(end.timestamp())})
    day += timedelta(days=1)
result={'source':'https://www.nasdaqtrader.com/trader.aspx?id=Calendar','timezone':'America/New_York','validThrough':'2026-12-31','policy':'Regular session only; no trading on unknown dates; emergency admin pause','sessions':rows,'opens':[r['open'] for r in rows],'closes':[r['close'] for r in rows]}
Path('contracts/config/nasdaq-pilot-calendar.json').write_text(json.dumps(result,indent=2)+'\n')
