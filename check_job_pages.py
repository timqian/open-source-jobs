#!/usr/bin/env python3
"""
Check if job pages in the CSV are still active and likely used for recruiting.
"""
import csv
import requests
from urllib.parse import urlparse
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
import json

def check_url(url, company_name, timeout=10):
    """
    Check if a URL is valid and likely a recruiting page.
    Returns a dict with status information.
    """
    result = {
        'url': url,
        'company': company_name,
        'accessible': False,
        'status_code': None,
        'final_url': url,
        'error': None,
        'is_recruiting_page': None,
        'notes': []
    }

    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }

        response = requests.get(url, headers=headers, timeout=timeout, allow_redirects=True)
        result['status_code'] = response.status_code
        result['final_url'] = response.url
        result['accessible'] = response.status_code == 200

        if response.status_code == 200:
            content = response.text.lower()

            # Check for common recruiting/career page indicators
            recruiting_keywords = [
                'career', 'job', 'hiring', 'position', 'open role',
                'join', 'work with', 'employment', 'vacancy', 'recruit',
                'apply', 'opportunity', 'opening'
            ]

            # Check for 404 or "no positions" indicators
            negative_keywords = [
                'no open positions', 'no current openings',
                'no positions available', 'not hiring',
                'no vacancies', '404', 'page not found'
            ]

            has_recruiting = any(keyword in content for keyword in recruiting_keywords)
            has_negative = any(keyword in content for keyword in negative_keywords)

            if has_recruiting and not has_negative:
                result['is_recruiting_page'] = True
                result['notes'].append('Appears to be an active recruiting page')
            elif has_negative:
                result['is_recruiting_page'] = False
                result['notes'].append('Page indicates no open positions')
            elif has_recruiting:
                result['is_recruiting_page'] = 'uncertain'
                result['notes'].append('Has recruiting keywords but may not have open positions')
            else:
                result['is_recruiting_page'] = 'uncertain'
                result['notes'].append('Unable to confirm recruiting status from content')

            # Check if redirected
            if response.url != url:
                result['notes'].append(f'Redirected to: {response.url}')

        elif response.status_code == 404:
            result['is_recruiting_page'] = False
            result['notes'].append('Page not found (404)')
        elif response.status_code in [301, 302, 303, 307, 308]:
            result['notes'].append(f'Redirected (status {response.status_code})')
        else:
            result['notes'].append(f'Unexpected status code: {response.status_code}')

    except requests.exceptions.Timeout:
        result['error'] = 'Request timeout'
        result['notes'].append('Connection timed out')
    except requests.exceptions.ConnectionError:
        result['error'] = 'Connection error'
        result['notes'].append('Unable to connect to server')
    except requests.exceptions.TooManyRedirects:
        result['error'] = 'Too many redirects'
        result['notes'].append('Too many redirects')
    except Exception as e:
        result['error'] = str(e)
        result['notes'].append(f'Error: {str(e)}')

    return result

def main():
    # Read CSV file
    csv_file = '/home/user/open-source-jobs/repos.csv'
    results = []

    print("Reading CSV file...")
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    # Get first 55 entries
    first_55 = rows[:55]
    print(f"Checking {len(first_55)} job pages...\n")

    # Check URLs with thread pool for faster processing
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = {}
        for idx, row in enumerate(first_55, 1):
            company = row['Repository']
            job_url = row['Job Page']
            future = executor.submit(check_url, job_url, company)
            futures[future] = (idx, company, job_url)

        for future in as_completed(futures):
            idx, company, job_url = futures[future]
            result = future.result()
            results.append(result)

            # Print progress
            status_icon = '✓' if result['accessible'] else '✗'
            recruiting_status = ''
            if result['is_recruiting_page'] == True:
                recruiting_status = ' [RECRUITING]'
            elif result['is_recruiting_page'] == False:
                recruiting_status = ' [NOT RECRUITING]'
            else:
                recruiting_status = ' [UNCERTAIN]'

            print(f"{idx:2d}. {status_icon} {company:40s} {recruiting_status}")
            if result['notes']:
                for note in result['notes']:
                    print(f"    → {note}")
            time.sleep(0.1)  # Small delay to avoid overwhelming servers

    # Generate summary
    print("\n" + "="*80)
    print("SUMMARY")
    print("="*80)

    accessible_count = sum(1 for r in results if r['accessible'])
    recruiting_yes = sum(1 for r in results if r['is_recruiting_page'] == True)
    recruiting_no = sum(1 for r in results if r['is_recruiting_page'] == False)
    recruiting_uncertain = sum(1 for r in results if r['is_recruiting_page'] == 'uncertain')

    print(f"Total checked: {len(results)}")
    print(f"Accessible (200 OK): {accessible_count}")
    print(f"Likely recruiting pages: {recruiting_yes}")
    print(f"Not recruiting: {recruiting_no}")
    print(f"Uncertain: {recruiting_uncertain}")
    print(f"Connection errors: {len(results) - accessible_count}")

    # Save detailed results to JSON
    output_file = '/home/user/open-source-jobs/job_pages_check_results.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"\nDetailed results saved to: {output_file}")

    # List problematic URLs
    print("\n" + "="*80)
    print("PROBLEMATIC PAGES (Not accessible or not recruiting)")
    print("="*80)
    problematic = [r for r in results if not r['accessible'] or r['is_recruiting_page'] == False]
    if problematic:
        for r in problematic:
            print(f"\n{r['company']}")
            print(f"  URL: {r['url']}")
            print(f"  Status: {r['status_code']}")
            if r['notes']:
                print(f"  Notes: {', '.join(r['notes'])}")
    else:
        print("No problematic pages found!")

if __name__ == '__main__':
    main()
