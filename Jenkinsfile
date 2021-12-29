loadLibrary "as24-fizz-community-library@v0.11.0"

pipeline {
    agent none

    options {
        timestamps()
        timeout(time: 2, unit: 'HOURS')
        buildDiscarder(logRotator(daysToKeepStr: '90'))
        preserveStashes(buildCount: 50)
    }

    environment {
        VERSION = getInvokedBuildNumber()
    }

    stages {
        stage('Publish') {
            when {
                beforeAgent true
                tag "*"
            }
            agent { node { label 'build-docker' } }
            steps {
                script {
                    dockerfile('Dockerfile.build').inside {
                        fast {
                            caching('/usr/local/share/.cache/yarn') {
                                sh 'yarn install'
                                sh 'yarn build'
                                sh 'yarn publish'
                            }
                        }
                    }
                }
            }
        }
    }

    post {
        failure {
            script {
                if (env.BRANCH_NAME == 'master') {
                    slackSend channel: '#as24-product-platform', color: 'danger',
                              message: "The pipeline <${env.BUILD_URL}|${currentBuild.fullDisplayName}> failed."
                }
            }
        }
    }
}
