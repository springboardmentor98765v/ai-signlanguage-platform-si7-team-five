import pytest
import sys

def main():
    print("🔍 Running full automated test suite for Milestone 3...")
    exit_code = pytest.main(["-v", "tests/"])
    if exit_code == 0:
        print("✅ All tests passed successfully!")
    else:
        print("❌ Some tests failed. Please check logs above.")
    sys.exit(exit_code)

if __name__ == "__main__":
    main()
