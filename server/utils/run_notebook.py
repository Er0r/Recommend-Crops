import sys
import os
import papermill as pm
import scrapbook as sb
import json

# Get paths
notebook_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'Crop_DL.ipynb')
csv_file_path = sys.argv[1]  # Input CSV file path
output_file = sys.argv[2]    # Output JSON file path

try:
    # Execute the notebook
    pm.execute_notebook(
        notebook_path,
        'output_notebook.ipynb',
        parameters=dict(csv_file=csv_file_path)
    )

    # Read the executed notebook
    nb = sb.read_notebook('output_notebook.ipynb')

    # Extract results
    results = nb.scraps.get('results', None)
    if results is None:
        raise ValueError("'results' scrap not found in the executed notebook.")

    # Save results to the provided output file path
    with open(output_file, 'w') as f:
        json.dump(results.data, f)

    print(f"Results saved to {output_file}")

except Exception as e:
    print(f"Error: {str(e)}", file=sys.stderr)
    sys.exit(1)
