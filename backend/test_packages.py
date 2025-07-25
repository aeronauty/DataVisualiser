#!/usr/bin/env python3
"""
Test script to verify all packages work correctly with the latest versions
"""

def test_imports():
    """Test that all required packages can be imported successfully"""
    try:
        import fastapi
        print(f"✅ FastAPI {fastapi.__version__}")
        
        import uvicorn
        print(f"✅ Uvicorn {uvicorn.__version__}")
        
        import polars as pl
        print(f"✅ Polars {pl.__version__}")
        
        import pydantic
        print(f"✅ Pydantic {pydantic.__version__}")
        
        import numpy as np
        print(f"✅ NumPy {np.__version__}")
        
        import pandas as pd
        print(f"✅ Pandas {pd.__version__}")
        
        print("\n🎉 All packages imported successfully!")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False

def test_basic_functionality():
    """Test basic functionality of key packages"""
    try:
        import polars as pl
        import numpy as np
        import pandas as pd
        
        # Test NumPy 2.1+ functionality
        arr = np.array([1, 2, 3, 4, 5])
        print(f"✅ NumPy array created: {arr}")
        
        # Test Polars functionality
        df = pl.DataFrame({
            'x': [1, 2, 3, 4, 5],
            'y': [2, 4, 6, 8, 10],
            'category': ['A', 'B', 'A', 'B', 'A']
        })
        print(f"✅ Polars DataFrame created with {df.shape[0]} rows")
        
        # Test LazyFrame
        lazy_df = df.lazy()
        result = lazy_df.filter(pl.col('x') > 2).collect()
        print(f"✅ Polars LazyFrame filtering works: {result.shape[0]} rows after filter")
        
        # Test Pandas compatibility
        pd_df = df.to_pandas()
        print(f"✅ Polars to Pandas conversion works: {type(pd_df)}")
        
        print("\n🎉 All functionality tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ Functionality test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Testing Python package compatibility...")
    print("="*50)
    
    import_success = test_imports()
    print()
    
    if import_success:
        functionality_success = test_basic_functionality()
    else:
        functionality_success = False
    
    print("="*50)
    if import_success and functionality_success:
        print("✅ All tests passed! Your environment is ready.")
        return 0
    else:
        print("❌ Some tests failed. Check your installation.")
        return 1

if __name__ == "__main__":
    exit(main())
