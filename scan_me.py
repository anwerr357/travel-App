# Removed dangerous eval() function usage to comply with SOC 2 CC6.1
# The eval() function allows arbitrary code execution which violates logical access controls

def run(cmd):
    # Replace eval() with safe command execution
    # Only allow predefined, validated commands
    allowed_commands = {
        'status': lambda: 'System status OK',
        'version': lambda: 'Version 1.0.0',
        'info': lambda: 'System information'
    }
    
    if cmd in allowed_commands:
        return allowed_commands[cmd]()
    else:
        raise ValueError(f"Command '{cmd}' not allowed. Permitted commands: {list(allowed_commands.keys())}")

def run2(cmd):
    # Replace eval() with safe command execution
    # Only allow predefined, validated commands
    allowed_commands = {
        'status': lambda: 'System status OK',
        'version': lambda: 'Version 1.0.0',
        'info': lambda: 'System information'
    }
    
    if cmd in allowed_commands:
        return allowed_commands[cmd]()
    else:
        raise ValueError(f"Command '{cmd}' not allowed. Permitted commands: {list(allowed_commands.keys())}")