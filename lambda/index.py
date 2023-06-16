import os
import boto3


def lambda_handler(event, context):
    # AWS SDKのクライアントを作成
    ssm_client = boto3.client('ssm')

    # 環境変数から値を取得
    instance_id = os.environ.get('INSTANCE_ID')
    ssm_role_arn = os.environ.get('SSM_ROLE_ARN')
    sns_arn = os.environ.get('SNS_ARN')

    # 外部のシェルスクリプトファイルを読み込む
    with open('./script.sh', 'r') as file:
        script_content = file.read()

    # SSMのsend-commandを呼び出す
    response = ssm_client.send_command(
        DocumentName='AWS-RunShellScript',
        Parameters={
            'commands': [
                script_content,
            ],
            'workingDirectory': ['/home/ec2-user']
        },
        InstanceIds=[
            instance_id
        ],
        ServiceRoleArn=ssm_role_arn,
        NotificationConfig={
            'NotificationArn': sns_arn,
            'NotificationEvents': [
                'All'
            ],
            'NotificationType': 'Command'
        }
    )

    # 実行結果の詳細情報を表示
    command_id = response['Command']['CommandId']
    print(f"Command '{command_id}' has been sent.")

    # 成功したらレスポンスを返す
    return {
        'statusCode': 200,
        'body': 'Command sent successfully.'
    }
