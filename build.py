import re
import subprocess

def increment_version(version_string):
    major, minor, patch = map(int, version_string.split('.'))
    patch += 1
    if patch > 9:
        patch = 0
        minor += 1
        if minor > 9:
            minor = 0
            major += 1
    return f"{major}.{minor}.{patch}"

def update_docker_compose(file_path, new_version):
    with open(file_path, 'r') as file:
        content = file.read()

    updated_content = re.sub(
        r'(image:\s*nilu2039/flixr-server:)(\d+\.\d+\.\d+)',
        rf'\g<1>{new_version}',
        content
    )

    with open(file_path, 'w') as file:
        file.write(updated_content)

def build_and_push_docker_image(new_version):
    command = f"docker buildx build --platform linux/amd64 -t nilu2039/flixr-server:{new_version} --target prod --push ."
    try:
        subprocess.run(command, shell=True, check=True)
        print(f"Successfully built and pushed Docker image with tag {new_version}")
    except subprocess.CalledProcessError as e:
        print(f"Error building Docker image: {e}")



if __name__ == "__main__":
    with open('version.txt', 'r') as f:
        current_version = f.read().strip()

    new_version = increment_version(current_version)

    with open('version.txt', 'w') as f:
        f.write(new_version)

    update_docker_compose('docker-compose.prod.yml', new_version)

    print(f"Updated to version {new_version}")

    build_and_push_docker_image(new_version)
