# SECURITY WARNING: The following functions have been disabled due to SOC 2 CC6.1 compliance
# Dynamic code execution poses security risks and violates logical access controls

def run(cmd):
    # Disabled eval() to prevent arbitrary code execution
    # which violates SOC 2 CC6.1 logical access controls
    raise SecurityError("Dynamic code execution is disabled for security compliance")

def run2(cmd):
    # Disabled eval() to prevent arbitrary code execution
    # which violates SOC 2 CC6.1 logical access controls
    raise SecurityError("Dynamic code execution is disabled for security compliance")

# Note: Duplicate function definitions removed for code clarity
# If multiple run2 functions are needed, use distinct names

class SecurityError(Exception):
    """Custom exception for security-related errors"""
    pass